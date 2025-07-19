from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    FINISHED = "finished"
    CANCELLED = "cancelled"

# Models
class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo_url: Optional[str] = None
    founded_year: Optional[int] = None
    city: str
    players_count: Optional[int] = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    founded_year: Optional[int] = None
    city: str
    players_count: Optional[int] = 0

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team_id: str
    away_team_id: str
    home_team_score: Optional[int] = None
    away_team_score: Optional[int] = None
    match_date: datetime
    venue: str
    status: MatchStatus = MatchStatus.SCHEDULED
    referee: Optional[str] = None
    attendance: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MatchCreate(BaseModel):
    home_team_id: str
    away_team_id: str
    match_date: datetime
    venue: str
    referee: Optional[str] = None

class MatchUpdate(BaseModel):
    home_team_score: Optional[int] = None
    away_team_score: Optional[int] = None
    status: Optional[MatchStatus] = None
    attendance: Optional[int] = None
    notes: Optional[str] = None

class Ranking(BaseModel):
    team_id: str
    team_name: str
    played: int = 0
    won: int = 0
    drawn: int = 0
    lost: int = 0
    goals_for: int = 0
    goals_against: int = 0
    goal_difference: int = 0
    points: int = 0
    position: int = 0

class News(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NewsCreate(BaseModel):
    title: str
    content: str
    author: str
    image_url: Optional[str] = None
    published: bool = True

# Helper functions
async def calculate_rankings():
    """Calculate team rankings based on finished matches"""
    teams = await db.teams.find().to_list(1000)
    rankings = []
    
    for team in teams:
        team_ranking = {
            "team_id": team["id"],
            "team_name": team["name"],
            "played": 0,
            "won": 0,
            "drawn": 0,
            "lost": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_difference": 0,
            "points": 0
        }
        
        # Get all finished matches for this team
        matches = await db.matches.find({
            "$or": [
                {"home_team_id": team["id"]},
                {"away_team_id": team["id"]}
            ],
            "status": "finished"
        }).to_list(1000)
        
        for match in matches:
            if match.get("home_team_score") is not None and match.get("away_team_score") is not None:
                team_ranking["played"] += 1
                
                if match["home_team_id"] == team["id"]:
                    # Team is home
                    team_ranking["goals_for"] += match["home_team_score"]
                    team_ranking["goals_against"] += match["away_team_score"]
                    
                    if match["home_team_score"] > match["away_team_score"]:
                        team_ranking["won"] += 1
                        team_ranking["points"] += 3
                    elif match["home_team_score"] == match["away_team_score"]:
                        team_ranking["drawn"] += 1
                        team_ranking["points"] += 1
                    else:
                        team_ranking["lost"] += 1
                else:
                    # Team is away
                    team_ranking["goals_for"] += match["away_team_score"]
                    team_ranking["goals_against"] += match["home_team_score"]
                    
                    if match["away_team_score"] > match["home_team_score"]:
                        team_ranking["won"] += 1
                        team_ranking["points"] += 3
                    elif match["away_team_score"] == match["home_team_score"]:
                        team_ranking["drawn"] += 1
                        team_ranking["points"] += 1
                    else:
                        team_ranking["lost"] += 1
        
        team_ranking["goal_difference"] = team_ranking["goals_for"] - team_ranking["goals_against"]
        rankings.append(team_ranking)
    
    # Sort by points, then goal difference, then goals for
    rankings.sort(key=lambda x: (-x["points"], -x["goal_difference"], -x["goals_for"]))
    
    # Add positions
    for i, ranking in enumerate(rankings):
        ranking["position"] = i + 1
    
    return rankings

# API Routes

# Teams
@api_router.post("/teams", response_model=Team)
async def create_team(team_data: TeamCreate):
    team = Team(**team_data.dict())
    await db.teams.insert_one(team.dict())
    return team

@api_router.get("/teams", response_model=List[Team])
async def get_teams():
    teams = await db.teams.find().to_list(1000)
    return [Team(**team) for team in teams]

@api_router.get("/teams/{team_id}", response_model=Team)
async def get_team(team_id: str):
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    return Team(**team)

@api_router.delete("/teams/{team_id}")
async def delete_team(team_id: str):
    # Check if team exists
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    
    # Check if team has matches
    matches_count = await db.matches.count_documents({
        "$or": [{"home_team_id": team_id}, {"away_team_id": team_id}]
    })
    
    if matches_count > 0:
        raise HTTPException(status_code=400, detail="Impossible de supprimer une équipe qui a des matchs associés")
    
    await db.teams.delete_one({"id": team_id})
    return {"message": "Équipe supprimée avec succès"}

# Matches
@api_router.post("/matches", response_model=Match)
async def create_match(match_data: MatchCreate):
    # Verify teams exist
    home_team = await db.teams.find_one({"id": match_data.home_team_id})
    away_team = await db.teams.find_one({"id": match_data.away_team_id})
    
    if not home_team or not away_team:
        raise HTTPException(status_code=404, detail="Une ou plusieurs équipes non trouvées")
    
    if match_data.home_team_id == match_data.away_team_id:
        raise HTTPException(status_code=400, detail="Une équipe ne peut pas jouer contre elle-même")
    
    match = Match(**match_data.dict())
    await db.matches.insert_one(match.dict())
    return match

@api_router.get("/matches", response_model=List[Match])
async def get_matches():
    matches = await db.matches.find().sort("match_date", 1).to_list(1000)
    return [Match(**match) for match in matches]

@api_router.get("/matches/{match_id}", response_model=Match)
async def get_match(match_id: str):
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match non trouvé")
    return Match(**match)

@api_router.put("/matches/{match_id}", response_model=Match)
async def update_match(match_id: str, match_update: MatchUpdate):
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match non trouvé")
    
    update_data = {k: v for k, v in match_update.dict().items() if v is not None}
    
    if update_data:
        await db.matches.update_one({"id": match_id}, {"$set": update_data})
    
    updated_match = await db.matches.find_one({"id": match_id})
    return Match(**updated_match)

@api_router.delete("/matches/{match_id}")
async def delete_match(match_id: str):
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match non trouvé")
    
    await db.matches.delete_one({"id": match_id})
    return {"message": "Match supprimé avec succès"}

# Rankings
@api_router.get("/rankings", response_model=List[Ranking])
async def get_rankings():
    rankings = await calculate_rankings()
    return [Ranking(**ranking) for ranking in rankings]

# News
@api_router.post("/news", response_model=News)
async def create_news(news_data: NewsCreate):
    news = News(**news_data.dict())
    await db.news.insert_one(news.dict())
    return news

@api_router.get("/news", response_model=List[News])
async def get_news():
    news_list = await db.news.find({"published": True}).sort("created_at", -1).to_list(1000)
    return [News(**news) for news in news_list]

@api_router.get("/news/{news_id}", response_model=News)
async def get_news_item(news_id: str):
    news = await db.news.find_one({"id": news_id})
    if not news:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return News(**news)

# Dashboard/Statistics
@api_router.get("/dashboard")
async def get_dashboard_stats():
    teams_count = await db.teams.count_documents({})
    matches_count = await db.matches.count_documents({})
    finished_matches = await db.matches.count_documents({"status": "finished"})
    upcoming_matches = await db.matches.count_documents({"status": "scheduled"})
    
    return {
        "teams_count": teams_count,
        "matches_count": matches_count,
        "finished_matches": finished_matches,
        "upcoming_matches": upcoming_matches
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()