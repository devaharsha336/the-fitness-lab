from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import secrets
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# App setup
app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Pydantic Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class MemberCreate(BaseModel):
    name: str
    plan: str
    status: str = "active"
    phone: str = ""
    email: str = ""

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class ClassCreate(BaseModel):
    name: str
    time: str
    trainer: str
    capacity: int = 20
    day: str = "Monday"

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class EnquiryCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class PricingPlanUpdate(BaseModel):
    name: str
    price: int
    features: List[str]

class ProgramUpdate(BaseModel):
    name: str
    description: str
    trainer: str
    schedule: str = ""

# --- Auth Routes ---
@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {
        "id": user_id,
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
        "token": access_token
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    db_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(data.current_password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    new_hash = hash_password(data.new_password)
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password changed successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# --- Members Routes ---
@api_router.get("/members")
async def get_members(user: dict = Depends(get_current_user)):
    members = await db.members.find({}, {"_id": 0}).to_list(1000)
    return members

@api_router.post("/members")
async def create_member(data: MemberCreate, user: dict = Depends(get_current_user)):
    member = {
        "id": secrets.token_hex(8),
        "name": data.name,
        "plan": data.plan,
        "status": data.status,
        "phone": data.phone,
        "email": data.email,
        "joined_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.members.insert_one(member)
    member.pop("_id", None)
    return member

@api_router.put("/members/{member_id}")
async def update_member(member_id: str, data: MemberUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.members.update_one({"id": member_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    updated = await db.members.find_one({"id": member_id}, {"_id": 0})
    return updated

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, user: dict = Depends(get_current_user)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted"}

# --- Classes Routes ---
@api_router.get("/classes")
async def get_classes(user: dict = Depends(get_current_user)):
    classes = await db.classes.find({}, {"_id": 0}).to_list(100)
    return classes

@api_router.post("/classes")
async def create_class(data: ClassCreate, user: dict = Depends(get_current_user)):
    class_doc = {
        "id": secrets.token_hex(8),
        "name": data.name,
        "time": data.time,
        "trainer": data.trainer,
        "capacity": data.capacity,
        "day": data.day,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.classes.insert_one(class_doc)
    class_doc.pop("_id", None)
    return class_doc

@api_router.delete("/classes/{class_id}")
async def delete_class(class_id: str, user: dict = Depends(get_current_user)):
    result = await db.classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted"}

# --- Stats ---
@api_router.get("/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    total_members = await db.members.count_documents({})
    active_members = await db.members.count_documents({"status": "active"})
    # Revenue calculation based on plans
    plans_revenue = {"Basic": 999, "Pro": 1999, "Elite": 3999}
    members = await db.members.find({"status": "active"}, {"_id": 0, "plan": 1}).to_list(1000)
    revenue = sum(plans_revenue.get(m.get("plan", "Basic"), 999) for m in members)
    today_str = datetime.now(timezone.utc).strftime("%A")
    today_classes = await db.classes.count_documents({"day": today_str})
    checkins = await db.checkins.count_documents({
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    })
    return {
        "total_members": total_members,
        "active_members": active_members,
        "revenue_this_month": revenue,
        "checkins_today": checkins,
        "today_classes": today_classes
    }

# --- Announcements ---
@api_router.get("/announcements")
async def get_announcements(user: dict = Depends(get_current_user)):
    announcements = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return announcements

@api_router.post("/announcements")
async def create_announcement(data: AnnouncementCreate, user: dict = Depends(get_current_user)):
    announcement = {
        "id": secrets.token_hex(8),
        "title": data.title,
        "content": data.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "author": user.get("name", "Admin"),
    }
    await db.announcements.insert_one(announcement)
    announcement.pop("_id", None)
    return announcement

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, user: dict = Depends(get_current_user)):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

# --- Enquiries ---
@api_router.post("/enquiries")
async def create_enquiry(data: EnquiryCreate):
    enquiry = {
        "id": secrets.token_hex(8),
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.enquiries.insert_one(enquiry)
    enquiry.pop("_id", None)
    return {"message": "Enquiry submitted successfully", "enquiry": enquiry}

@api_router.get("/enquiries")
async def get_enquiries(user: dict = Depends(get_current_user)):
    enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return enquiries

# --- Pricing ---
@api_router.get("/pricing")
async def get_pricing():
    plans = await db.pricing.find({}, {"_id": 0}).sort("order", 1).to_list(10)
    return plans

@api_router.put("/pricing")
async def update_pricing(plans: List[PricingPlanUpdate], user: dict = Depends(get_current_user)):
    for i, plan in enumerate(plans):
        await db.pricing.update_one(
            {"name": plan.name},
            {"$set": {"monthly": plan.monthly, "quarterly": plan.quarterly, "half_yearly": plan.half_yearly, "yearly": plan.yearly, "badge": plan.badge, "order": i}},
            upsert=True
        )
    updated = await db.pricing.find({}, {"_id": 0}).sort("order", 1).to_list(10)
    return updated

# --- Programs ---
@api_router.get("/programs")
async def get_programs():
    programs = await db.programs.find({}, {"_id": 0}).to_list(20)
    return programs

@api_router.put("/programs")
async def update_programs(programs: List[ProgramUpdate], user: dict = Depends(get_current_user)):
    await db.programs.delete_many({})
    if programs:
        docs = []
        for p in programs:
            docs.append({
                "id": secrets.token_hex(8),
                "name": p.name,
                "description": p.description,
                "trainer": p.trainer,
                "schedule": p.schedule,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
        await db.programs.insert_many(docs)
    updated = await db.programs.find({}, {"_id": 0}).to_list(20)
    return updated

# Health check
@api_router.get("/")
async def root():
    return {"message": "The Fitness Lab API is running"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Startup: seed admin + sample data
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@thefitnesslab.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "fitlab2024")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    # Seed sample members if empty
    if await db.members.count_documents({}) == 0:
        sample_members = [
            {"id": secrets.token_hex(8), "name": "Rahul Sharma", "plan": "Elite", "status": "active", "phone": "+91 98765 12345", "email": "rahul@email.com", "joined_at": "2025-01-15T10:00:00Z"},
            {"id": secrets.token_hex(8), "name": "Priya Patel", "plan": "Pro", "status": "active", "phone": "+91 98765 22345", "email": "priya@email.com", "joined_at": "2025-02-01T10:00:00Z"},
            {"id": secrets.token_hex(8), "name": "Arjun Singh", "plan": "Basic", "status": "expired", "phone": "+91 98765 32345", "email": "arjun@email.com", "joined_at": "2024-11-20T10:00:00Z"},
            {"id": secrets.token_hex(8), "name": "Sneha Reddy", "plan": "Elite", "status": "active", "phone": "+91 98765 42345", "email": "sneha@email.com", "joined_at": "2025-01-28T10:00:00Z"},
            {"id": secrets.token_hex(8), "name": "Vikram Joshi", "plan": "Pro", "status": "active", "phone": "+91 98765 52345", "email": "vikram@email.com", "joined_at": "2024-12-10T10:00:00Z"},
            {"id": secrets.token_hex(8), "name": "Ananya Gupta", "plan": "Basic", "status": "active", "phone": "+91 98765 62345", "email": "ananya@email.com", "joined_at": "2025-02-10T10:00:00Z"},
        ]
        await db.members.insert_many(sample_members)
        logger.info("Sample members seeded")

    # Seed sample classes if empty
    if await db.classes.count_documents({}) == 0:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        sample_classes = [
            {"id": secrets.token_hex(8), "name": "HIIT Burn", "time": "06:00 AM", "trainer": "Coach Vikram", "capacity": 25, "day": "Monday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Strength Training", "time": "07:30 AM", "trainer": "Coach Priya", "capacity": 20, "day": "Monday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Power Yoga", "time": "09:00 AM", "trainer": "Coach Meera", "capacity": 30, "day": "Tuesday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Boxing Fundamentals", "time": "05:00 PM", "trainer": "Coach Arjun", "capacity": 15, "day": "Wednesday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Cycling Sprint", "time": "06:30 PM", "trainer": "Coach Vikram", "capacity": 20, "day": "Thursday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "HIIT Burn", "time": "06:00 AM", "trainer": "Coach Vikram", "capacity": 25, "day": "Friday", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Full Body Strength", "time": "08:00 AM", "trainer": "Coach Priya", "capacity": 20, "day": "Saturday", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.classes.insert_many(sample_classes)
        logger.info("Sample classes seeded")

    # Seed sample announcements if empty
    if await db.announcements.count_documents({}) == 0:
        sample_announcements = [
            {"id": secrets.token_hex(8), "title": "New Year Offer!", "content": "Get 20% off on Elite memberships this month. Limited slots!", "created_at": datetime.now(timezone.utc).isoformat(), "author": "Admin"},
            {"id": secrets.token_hex(8), "title": "Gym Timings Update", "content": "Starting Feb 1st, we'll be open from 5 AM to 11 PM on weekdays.", "created_at": datetime.now(timezone.utc).isoformat(), "author": "Admin"},
        ]
        await db.announcements.insert_many(sample_announcements)
        logger.info("Sample announcements seeded")

    # Seed pricing if empty
    if await db.pricing.count_documents({}) == 0:
        sample_pricing = [
            {"name": "Individual", "monthly": 2500, "quarterly": 6500, "half_yearly": 10500, "yearly": 15000, "badge": None, "order": 0},
            {"name": "Couple", "monthly": 4500, "quarterly": 11000, "half_yearly": 18000, "yearly": 30000, "badge": "Best Price", "order": 1},
            {"name": "Gold Personal Training", "monthly": 7000, "quarterly": 20000, "half_yearly": 38000, "yearly": 70000, "badge": "Best Price", "order": 2},
            {"name": "Platinum Personal Training", "monthly": 15000, "quarterly": 40000, "half_yearly": 75000, "yearly": 120000, "badge": "Best Price", "order": 3},
        ]
        await db.pricing.insert_many(sample_pricing)
        logger.info("Sample pricing seeded")
    else:
        # Force update pricing to new format if old format exists
        sample = await db.pricing.find_one({})
        if sample and "price" in sample and "monthly" not in sample:
            await db.pricing.delete_many({})
            sample_pricing = [
                {"name": "Individual", "monthly": 2500, "quarterly": 6500, "half_yearly": 10500, "yearly": 15000, "badge": None, "order": 0},
                {"name": "Couple", "monthly": 4500, "quarterly": 11000, "half_yearly": 18000, "yearly": 30000, "badge": "Best Price", "order": 1},
                {"name": "Gold Personal Training", "monthly": 7000, "quarterly": 20000, "half_yearly": 38000, "yearly": 70000, "badge": "Best Price", "order": 2},
                {"name": "Platinum Personal Training", "monthly": 15000, "quarterly": 40000, "half_yearly": 75000, "yearly": 120000, "badge": "Best Price", "order": 3},
            ]
            await db.pricing.insert_many(sample_pricing)
            logger.info("Pricing migrated to new format")

    # Seed programs if empty
    if await db.programs.count_documents({}) == 0:
        sample_programs = [
            {"id": secrets.token_hex(8), "name": "HIIT", "description": "High-intensity intervals that torch calories and build endurance.", "trainer": "Coach Vikram", "schedule": "Mon, Wed, Fri - 6:00 AM", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Strength Training", "description": "Build raw power with progressive overload training.", "trainer": "Coach Priya", "schedule": "Mon, Thu - 7:30 AM", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Yoga", "description": "Flexibility, mindfulness, and deep recovery sessions.", "trainer": "Coach Meera", "schedule": "Tue, Sat - 9:00 AM", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Boxing", "description": "Explosive combos, footwork drills, and total-body conditioning.", "trainer": "Coach Arjun", "schedule": "Wed, Fri - 5:00 PM", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": secrets.token_hex(8), "name": "Cycling", "description": "Pedal-powered endurance and sprint training on pro bikes.", "trainer": "Coach Vikram", "schedule": "Thu, Sat - 6:30 PM", "updated_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.programs.insert_many(sample_programs)
        logger.info("Sample programs seeded")

    # Write test credentials
    creds_dir = Path("/app/memory")
    creds_dir.mkdir(exist_ok=True)
    (creds_dir / "test_credentials.md").write_text(
        f"# Test Credentials\n\n"
        f"## Admin\n"
        f"- Email: {admin_email}\n"
        f"- Password: {admin_password}\n"
        f"- Role: admin\n\n"
        f"## Auth Endpoints\n"
        f"- POST /api/auth/login\n"
        f"- POST /api/auth/logout\n"
        f"- GET /api/auth/me\n"
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
