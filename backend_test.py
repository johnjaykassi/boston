#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for BOSTON Football Competition
Tests all backend endpoints according to the test requirements
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Backend URL from frontend environment
BACKEND_URL = "https://9202cdcf-883d-45c2-bb98-e82394f769d8.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.created_teams = []
        self.created_matches = []
        self.created_news = []
        self.test_results = {
            "teams_api": {"passed": 0, "failed": 0, "errors": []},
            "matches_api": {"passed": 0, "failed": 0, "errors": []},
            "rankings_api": {"passed": 0, "failed": 0, "errors": []},
            "news_api": {"passed": 0, "failed": 0, "errors": []},
            "dashboard_api": {"passed": 0, "failed": 0, "errors": []}
        }

    def log_result(self, category: str, test_name: str, success: bool, error_msg: str = ""):
        """Log test results"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]["failed"] += 1
            self.test_results[category]["errors"].append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")

    def test_teams_api(self):
        """Test Teams CRUD operations"""
        print("\n🏆 Testing Teams API...")
        
        # Test 1: Create teams
        teams_data = [
            {"name": "FC Barcelona", "city": "Barcelona", "founded_year": 1899, "players_count": 25},
            {"name": "Real Madrid", "city": "Madrid", "founded_year": 1902, "players_count": 24},
            {"name": "Manchester United", "city": "Manchester", "founded_year": 1878, "players_count": 26},
            {"name": "Liverpool FC", "city": "Liverpool", "founded_year": 1892, "players_count": 23},
            {"name": "Bayern Munich", "city": "Munich", "founded_year": 1900, "players_count": 25},
            {"name": "Paris Saint-Germain", "city": "Paris", "founded_year": 1970, "players_count": 24}
        ]
        
        for team_data in teams_data:
            try:
                response = self.session.post(f"{self.base_url}/teams", json=team_data)
                if response.status_code == 200:
                    team = response.json()
                    self.created_teams.append(team)
                    self.log_result("teams_api", f"Create team {team_data['name']}", True)
                else:
                    self.log_result("teams_api", f"Create team {team_data['name']}", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("teams_api", f"Create team {team_data['name']}", False, str(e))

        # Test 2: Get all teams
        try:
            response = self.session.get(f"{self.base_url}/teams")
            if response.status_code == 200:
                teams = response.json()
                if len(teams) >= len(teams_data):
                    self.log_result("teams_api", "Get all teams", True)
                else:
                    self.log_result("teams_api", "Get all teams", False, 
                                  f"Expected at least {len(teams_data)} teams, got {len(teams)}")
            else:
                self.log_result("teams_api", "Get all teams", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("teams_api", "Get all teams", False, str(e))

        # Test 3: Get specific team
        if self.created_teams:
            try:
                team_id = self.created_teams[0]["id"]
                response = self.session.get(f"{self.base_url}/teams/{team_id}")
                if response.status_code == 200:
                    team = response.json()
                    if team["id"] == team_id:
                        self.log_result("teams_api", "Get specific team", True)
                    else:
                        self.log_result("teams_api", "Get specific team", False, "Team ID mismatch")
                else:
                    self.log_result("teams_api", "Get specific team", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("teams_api", "Get specific team", False, str(e))

        # Test 4: Get non-existent team
        try:
            response = self.session.get(f"{self.base_url}/teams/non-existent-id")
            if response.status_code == 404:
                self.log_result("teams_api", "Get non-existent team (404 expected)", True)
            else:
                self.log_result("teams_api", "Get non-existent team (404 expected)", False, 
                              f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("teams_api", "Get non-existent team (404 expected)", False, str(e))

    def test_matches_api(self):
        """Test Matches CRUD operations and validation"""
        print("\n⚽ Testing Matches API...")
        
        if len(self.created_teams) < 2:
            self.log_result("matches_api", "Matches API tests", False, "Need at least 2 teams to test matches")
            return

        # Test 1: Create valid matches
        matches_data = [
            {
                "home_team_id": self.created_teams[0]["id"],
                "away_team_id": self.created_teams[1]["id"],
                "match_date": (datetime.now() + timedelta(days=7)).isoformat(),
                "venue": "Camp Nou",
                "referee": "John Smith"
            },
            {
                "home_team_id": self.created_teams[2]["id"],
                "away_team_id": self.created_teams[3]["id"],
                "match_date": (datetime.now() + timedelta(days=14)).isoformat(),
                "venue": "Old Trafford",
                "referee": "Mike Dean"
            },
            {
                "home_team_id": self.created_teams[4]["id"],
                "away_team_id": self.created_teams[5]["id"],
                "match_date": (datetime.now() + timedelta(days=21)).isoformat(),
                "venue": "Allianz Arena",
                "referee": "Antonio Mateu"
            }
        ]

        for i, match_data in enumerate(matches_data):
            try:
                response = self.session.post(f"{self.base_url}/matches", json=match_data)
                if response.status_code == 200:
                    match = response.json()
                    self.created_matches.append(match)
                    self.log_result("matches_api", f"Create match {i+1}", True)
                else:
                    self.log_result("matches_api", f"Create match {i+1}", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("matches_api", f"Create match {i+1}", False, str(e))

        # Test 2: Validation - team can't play against itself
        try:
            invalid_match = {
                "home_team_id": self.created_teams[0]["id"],
                "away_team_id": self.created_teams[0]["id"],
                "match_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "venue": "Test Stadium"
            }
            response = self.session.post(f"{self.base_url}/matches", json=invalid_match)
            if response.status_code == 400:
                self.log_result("matches_api", "Validation: team vs itself (400 expected)", True)
            else:
                self.log_result("matches_api", "Validation: team vs itself (400 expected)", False, 
                              f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("matches_api", "Validation: team vs itself (400 expected)", False, str(e))

        # Test 3: Validation - non-existent teams
        try:
            invalid_match = {
                "home_team_id": "non-existent-team-1",
                "away_team_id": "non-existent-team-2",
                "match_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "venue": "Test Stadium"
            }
            response = self.session.post(f"{self.base_url}/matches", json=invalid_match)
            if response.status_code == 404:
                self.log_result("matches_api", "Validation: non-existent teams (404 expected)", True)
            else:
                self.log_result("matches_api", "Validation: non-existent teams (404 expected)", False, 
                              f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("matches_api", "Validation: non-existent teams (404 expected)", False, str(e))

        # Test 4: Get all matches
        try:
            response = self.session.get(f"{self.base_url}/matches")
            if response.status_code == 200:
                matches = response.json()
                if len(matches) >= len(self.created_matches):
                    self.log_result("matches_api", "Get all matches", True)
                else:
                    self.log_result("matches_api", "Get all matches", False, 
                                  f"Expected at least {len(self.created_matches)} matches, got {len(matches)}")
            else:
                self.log_result("matches_api", "Get all matches", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("matches_api", "Get all matches", False, str(e))

        # Test 5: Update match with scores and status
        if self.created_matches:
            try:
                match_id = self.created_matches[0]["id"]
                update_data = {
                    "home_team_score": 3,
                    "away_team_score": 1,
                    "status": "finished",
                    "attendance": 75000
                }
                response = self.session.put(f"{self.base_url}/matches/{match_id}", json=update_data)
                if response.status_code == 200:
                    updated_match = response.json()
                    if (updated_match["home_team_score"] == 3 and 
                        updated_match["away_team_score"] == 1 and 
                        updated_match["status"] == "finished"):
                        self.log_result("matches_api", "Update match scores and status", True)
                        # Update our local copy for rankings test
                        self.created_matches[0] = updated_match
                    else:
                        self.log_result("matches_api", "Update match scores and status", False, 
                                      "Updated data doesn't match expected values")
                else:
                    self.log_result("matches_api", "Update match scores and status", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("matches_api", "Update match scores and status", False, str(e))

        # Test 6: Update another match for rankings test
        if len(self.created_matches) > 1:
            try:
                match_id = self.created_matches[1]["id"]
                update_data = {
                    "home_team_score": 2,
                    "away_team_score": 2,
                    "status": "finished",
                    "attendance": 65000
                }
                response = self.session.put(f"{self.base_url}/matches/{match_id}", json=update_data)
                if response.status_code == 200:
                    self.created_matches[1] = response.json()
                    self.log_result("matches_api", "Update second match (draw)", True)
                else:
                    self.log_result("matches_api", "Update second match (draw)", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("matches_api", "Update second match (draw)", False, str(e))

    def test_rankings_api(self):
        """Test Rankings calculation system"""
        print("\n🏅 Testing Rankings API...")
        
        # Test 1: Get rankings
        try:
            response = self.session.get(f"{self.base_url}/rankings")
            if response.status_code == 200:
                rankings = response.json()
                self.log_result("rankings_api", "Get rankings", True)
                
                # Test 2: Verify rankings structure
                if rankings and isinstance(rankings, list):
                    first_team = rankings[0]
                    required_fields = ["team_id", "team_name", "played", "won", "drawn", "lost", 
                                     "goals_for", "goals_against", "goal_difference", "points", "position"]
                    
                    if all(field in first_team for field in required_fields):
                        self.log_result("rankings_api", "Rankings structure validation", True)
                    else:
                        missing_fields = [field for field in required_fields if field not in first_team]
                        self.log_result("rankings_api", "Rankings structure validation", False, 
                                      f"Missing fields: {missing_fields}")
                else:
                    self.log_result("rankings_api", "Rankings structure validation", False, 
                                  "Rankings should be a non-empty list")

                # Test 3: Verify points calculation (3-1-0 system)
                if len(rankings) >= 2:
                    # Find teams from our finished matches
                    team_stats = {}
                    for ranking in rankings:
                        team_stats[ranking["team_id"]] = ranking
                    
                    # Check if we have finished matches to verify
                    finished_matches = [m for m in self.created_matches if m.get("status") == "finished"]
                    if finished_matches:
                        points_correct = True
                        for match in finished_matches:
                            home_team_id = match["home_team_id"]
                            away_team_id = match["away_team_id"]
                            home_score = match.get("home_team_score", 0)
                            away_score = match.get("away_team_score", 0)
                            
                            if home_team_id in team_stats and away_team_id in team_stats:
                                home_stats = team_stats[home_team_id]
                                away_stats = team_stats[away_team_id]
                                
                                # Verify points calculation
                                if home_score > away_score:
                                    # Home team should have won points, away team should have lost
                                    if home_stats["won"] == 0 or away_stats["lost"] == 0:
                                        points_correct = False
                                elif home_score == away_score:
                                    # Both teams should have drawn points
                                    if home_stats["drawn"] == 0 or away_stats["drawn"] == 0:
                                        points_correct = False
                                else:
                                    # Away team should have won points, home team should have lost
                                    if away_stats["won"] == 0 or home_stats["lost"] == 0:
                                        points_correct = False
                        
                        self.log_result("rankings_api", "Points calculation (3-1-0 system)", points_correct, 
                                      "" if points_correct else "Points calculation doesn't match expected results")
                    else:
                        self.log_result("rankings_api", "Points calculation (3-1-0 system)", True, 
                                      "No finished matches to verify against")

                # Test 4: Verify sorting (points, goal difference, goals for)
                if len(rankings) >= 2:
                    sorted_correctly = True
                    for i in range(len(rankings) - 1):
                        current = rankings[i]
                        next_team = rankings[i + 1]
                        
                        # Check if current team should be ranked higher
                        if (current["points"] < next_team["points"] or
                            (current["points"] == next_team["points"] and 
                             current["goal_difference"] < next_team["goal_difference"]) or
                            (current["points"] == next_team["points"] and 
                             current["goal_difference"] == next_team["goal_difference"] and
                             current["goals_for"] < next_team["goals_for"])):
                            sorted_correctly = False
                            break
                    
                    self.log_result("rankings_api", "Rankings sorting validation", sorted_correctly,
                                  "" if sorted_correctly else "Rankings not sorted correctly")
                else:
                    self.log_result("rankings_api", "Rankings sorting validation", True, 
                                  "Not enough teams to verify sorting")

            else:
                self.log_result("rankings_api", "Get rankings", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("rankings_api", "Get rankings", False, str(e))

    def test_news_api(self):
        """Test News API operations"""
        print("\n📰 Testing News API...")
        
        # Test 1: Create news articles
        news_data = [
            {
                "title": "BOSTON Championship Kicks Off This Weekend",
                "content": "The highly anticipated BOSTON football championship begins this weekend with exciting matches between top teams.",
                "author": "Sports Reporter",
                "published": True
            },
            {
                "title": "Transfer Window Update",
                "content": "Several teams have made significant signings during the current transfer window.",
                "author": "Transfer Specialist",
                "published": True
            },
            {
                "title": "Draft Article",
                "content": "This is a draft article that should not appear in public listings.",
                "author": "Editor",
                "published": False
            }
        ]

        for i, news_item in enumerate(news_data):
            try:
                response = self.session.post(f"{self.base_url}/news", json=news_item)
                if response.status_code == 200:
                    news = response.json()
                    self.created_news.append(news)
                    self.log_result("news_api", f"Create news article {i+1}", True)
                else:
                    self.log_result("news_api", f"Create news article {i+1}", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_result("news_api", f"Create news article {i+1}", False, str(e))

        # Test 2: Get published news (should only return published articles)
        try:
            response = self.session.get(f"{self.base_url}/news")
            if response.status_code == 200:
                news_list = response.json()
                published_count = len([n for n in news_data if n["published"]])
                
                # Check if only published articles are returned
                all_published = all(news.get("published", False) for news in news_list)
                
                if all_published and len(news_list) >= published_count:
                    self.log_result("news_api", "Get published news only", True)
                else:
                    self.log_result("news_api", "Get published news only", False, 
                                  f"Expected only published articles, got {len(news_list)} articles")
            else:
                self.log_result("news_api", "Get published news only", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("news_api", "Get published news only", False, str(e))

    def test_dashboard_api(self):
        """Test Dashboard statistics API"""
        print("\n📊 Testing Dashboard API...")
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard")
            if response.status_code == 200:
                stats = response.json()
                
                # Test 1: Check required fields
                required_fields = ["teams_count", "matches_count", "finished_matches", "upcoming_matches"]
                if all(field in stats for field in required_fields):
                    self.log_result("dashboard_api", "Dashboard structure validation", True)
                    
                    # Test 2: Verify counts make sense
                    if (stats["teams_count"] >= len(self.created_teams) and
                        stats["matches_count"] >= len(self.created_matches) and
                        stats["finished_matches"] >= 0 and
                        stats["upcoming_matches"] >= 0):
                        self.log_result("dashboard_api", "Dashboard counts validation", True)
                    else:
                        self.log_result("dashboard_api", "Dashboard counts validation", False, 
                                      f"Counts don't match expected values: {stats}")
                else:
                    missing_fields = [field for field in required_fields if field not in stats]
                    self.log_result("dashboard_api", "Dashboard structure validation", False, 
                                  f"Missing fields: {missing_fields}")
            else:
                self.log_result("dashboard_api", "Get dashboard stats", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("dashboard_api", "Get dashboard stats", False, str(e))

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting comprehensive backend testing for BOSTON Football Competition")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Test in logical order following the workflow
        self.test_teams_api()
        self.test_matches_api()
        self.test_rankings_api()
        self.test_news_api()
        self.test_dashboard_api()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📋 TEST SUMMARY")
        print("=" * 80)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.upper().replace('_', ' ')}: {status} ({passed} passed, {failed} failed)")
            
            if results["errors"]:
                for error in results["errors"]:
                    print(f"  ❌ {error}")
        
        print(f"\nOVERALL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print(f"⚠️  {total_failed} tests failed. See details above.")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)