import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">⚽ BOSTON FC</h1>
          </div>
          <div className="flex items-center space-x-8">
            {[
              { key: 'home', label: 'Accueil' },
              { key: 'matches', label: 'Matchs' },
              { key: 'rankings', label: 'Classement' },
              { key: 'calendar', label: 'Calendrier' },
              { key: 'news', label: 'Actualités' },
              { key: 'admin', label: 'Admin' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes, matchesRes] = await Promise.all([
          axios.get(`${API}/dashboard`),
          axios.get(`${API}/news`),
          axios.get(`${API}/matches`)
        ]);
        
        setDashboardStats(statsRes.data);
        setRecentNews(newsRes.data.slice(0, 3));
        
        const upcoming = matchesRes.data
          .filter(match => match.status === 'scheduled')
          .slice(0, 3);
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxmb290YmFsbHxlbnwwfHx8Ymx1ZXwxNzUyODkwNDQ1fDA&ixlib=rb-4.1.0&q=85)'
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Championnat BOSTON
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            Suivez les matchs, classements et actualités de la compétition de football locale la plus passionnante de la région.
          </p>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardStats && [
                { label: 'Équipes', value: dashboardStats.teams_count, icon: '👥' },
                { label: 'Matchs', value: dashboardStats.matches_count, icon: '⚽' },
                { label: 'Matchs finis', value: dashboardStats.finished_matches, icon: '✅' },
                { label: 'À venir', value: dashboardStats.upcoming_matches, icon: '📅' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white bg-opacity-10 rounded-lg p-6">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Upcoming Matches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prochains Matchs</h2>
            <div className="space-y-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <div key={match.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Match à venir</p>
                        <p className="text-sm text-gray-600">{match.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(match.match_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(match.match_date).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucun match programmé</p>
              )}
            </div>
          </div>

          {/* Recent News */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dernières Actualités</h2>
            <div className="space-y-4">
              {recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <div key={news.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-gray-900">{news.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{news.content.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Par {news.author} - {new Date(news.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucune actualité récente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Matches Page Component
const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          axios.get(`${API}/matches`),
          axios.get(`${API}/teams`)
        ]);
        
        setMatches(matchesRes.data);
        setTeams(teamsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Équipe inconnue';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Programmé' },
      live: { color: 'bg-green-100 text-green-800', label: 'En cours' },
      finished: { color: 'bg-gray-100 text-gray-800', label: 'Terminé' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulé' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Tous les Matchs</h1>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {new Date(match.match_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.match_date).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {match.status === 'finished' && match.home_team_score !== null && match.away_team_score !== null ? (
                        <span className="font-bold">
                          {match.home_team_score} - {match.away_team_score}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {match.venue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(match.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {matches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun match programmé pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Rankings Page Component
const RankingsPage = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get(`${API}/rankings`);
        setRankings(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du classement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Classement Championnat BOSTON</h1>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    J
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    G
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BP
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BC
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    +/-
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((team, index) => (
                  <tr 
                    key={team.team_id} 
                    className={`hover:bg-gray-50 ${
                      index < 3 ? 'bg-green-50' : index >= rankings.length - 3 ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-yellow-600 text-yellow-100' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {team.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                      {team.won}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600 font-medium">
                      {team.drawn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                      {team.lost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.goals_for}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.goals_against}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-medium ${
                      team.goal_difference > 0 ? 'text-green-600' : 
                      team.goal_difference < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-blue-900">{team.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {rankings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune donnée de classement disponible</p>
              <p className="text-sm text-gray-400 mt-2">Les classements seront calculés automatiquement après les premiers matchs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Calendar Page Component
const CalendarPage = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          axios.get(`${API}/matches`),
          axios.get(`${API}/teams`)
        ]);
        
        setMatches(matchesRes.data);
        setTeams(teamsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement du calendrier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Équipe inconnue';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMatchesForDate = (date) => {
    if (!date) return [];
    return matches.filter(match => {
      const matchDate = new Date(match.match_date);
      return matchDate.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">
              Calendrier des Matchs
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={previousMonth}
                className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                ←
              </button>
              <span className="text-xl font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index} className="min-h-32 border border-gray-200 p-1">
                  {date && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {getMatchesForDate(date).map(match => (
                          <div key={match.id} className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                            <div className="truncate">
                              {getTeamName(match.home_team_id).substring(0, 8)} vs {getTeamName(match.away_team_id).substring(0, 8)}
                            </div>
                            <div className="truncate">
                              {new Date(match.match_date).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Page Component
const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API}/news`);
        setNews(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des actualités...</p>
        </div>
      </div>
    );
  }

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg">
            <div className="p-6">
              <button 
                onClick={() => setSelectedNews(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Retour aux actualités
              </button>
              
              {selectedNews.image_url && (
                <img 
                  src={selectedNews.image_url} 
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedNews.title}
              </h1>
              
              <div className="text-sm text-gray-600 mb-6">
                Par {selectedNews.author} - {new Date(selectedNews.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div className="prose prose-lg max-w-none">
                {selectedNews.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Actualités BOSTON FC</h1>
            <p className="text-gray-600 mt-2">Toutes les dernières nouvelles du championnat</p>
          </div>
          
          <div className="p-6">
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article) => (
                  <div key={article.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setSelectedNews(article)}>
                    {article.image_url && (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {article.content}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Par {article.author}</span>
                        <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune actualité disponible pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Page Component
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Team form
  const [teamForm, setTeamForm] = useState({
    name: '',
    city: '',
    founded_year: '',
    players_count: ''
  });
  
  // Match form
  const [matchForm, setMatchForm] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    venue: '',
    referee: ''
  });
  
  // News form
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    author: '',
    image_url: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchMatches();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const teamData = {
        ...teamForm,
        founded_year: teamForm.founded_year ? parseInt(teamForm.founded_year) : null,
        players_count: teamForm.players_count ? parseInt(teamForm.players_count) : 0
      };
      
      await axios.post(`${API}/teams`, teamData);
      setTeamForm({ name: '', city: '', founded_year: '', players_count: '' });
      fetchTeams();
      alert('Équipe créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      alert('Erreur lors de la création de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/matches`, matchForm);
      setMatchForm({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        venue: '',
        referee: ''
      });
      fetchMatches();
      alert('Match créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du match:', error);
      alert('Erreur lors de la création du match');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/news`, newsForm);
      setNewsForm({ title: '', content: '', author: '', image_url: '' });
      alert('Article créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      alert('Erreur lors de la création de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${teamName}" ?`)) {
      try {
        await axios.delete(`${API}/teams/${teamId}`);
        fetchTeams();
        alert('Équipe supprimée avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'équipe:', error);
        if (error.response?.status === 400) {
          alert('Impossible de supprimer une équipe qui a des matchs associés');
        } else {
          alert('Erreur lors de la suppression de l\'équipe');
        }
      }
    }
  };

  const handleDeleteMatch = async (matchId, homeTeam, awayTeam) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le match "${homeTeam} vs ${awayTeam}" ?`)) {
      try {
        await axios.delete(`${API}/matches/${matchId}`);
        fetchMatches();
        alert('Match supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du match:', error);
        alert('Erreur lors de la suppression du match');
      }
    }
  };

  const handleDeleteNews = async (newsId, newsTitle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${newsTitle}" ?`)) {
      try {
        await axios.delete(`${API}/news/${newsId}`);
        alert('Article supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'article:', error);
        alert('Erreur lors de la suppression de l\'article');
      }
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Équipe inconnue';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Administration BOSTON FC</h1>
            <p className="text-gray-600 mt-2">Gestion des équipes, matchs et actualités</p>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'teams', name: 'Équipes' },
                { id: 'matches', name: 'Matchs' },
                { id: 'news', name: 'Actualités' },
                { id: 'scores', name: 'Résultats' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'teams' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Créer une nouvelle équipe</h2>
                <form onSubmit={handleCreateTeam} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de l'équipe *</label>
                    <input
                      type="text"
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville *</label>
                    <input
                      type="text"
                      required
                      value={teamForm.city}
                      onChange={(e) => setTeamForm({...teamForm, city: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Année de fondation</label>
                    <input
                      type="number"
                      value={teamForm.founded_year}
                      onChange={(e) => setTeamForm({...teamForm, founded_year: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de joueurs</label>
                    <input
                      type="number"
                      value={teamForm.players_count}
                      onChange={(e) => setTeamForm({...teamForm, players_count: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer l\'équipe'}
                  </button>
                </form>
                
                {/* Teams List */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Équipes existantes ({teams.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map(team => (
                      <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.city}</p>
                        <p className="text-sm text-gray-600">
                          {team.founded_year && `Fondée en ${team.founded_year}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {team.players_count} joueurs
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'matches' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Programmer un nouveau match</h2>
                <form onSubmit={handleCreateMatch} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Équipe domicile *</label>
                    <select
                      required
                      value={matchForm.home_team_id}
                      onChange={(e) => setMatchForm({...matchForm, home_team_id: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Équipe extérieure *</label>
                    <select
                      required
                      value={matchForm.away_team_id}
                      onChange={(e) => setMatchForm({...matchForm, away_team_id: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date et heure *</label>
                    <input
                      type="datetime-local"
                      required
                      value={matchForm.match_date}
                      onChange={(e) => setMatchForm({...matchForm, match_date: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lieu *</label>
                    <input
                      type="text"
                      required
                      value={matchForm.venue}
                      onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Arbitre</label>
                    <input
                      type="text"
                      value={matchForm.referee}
                      onChange={(e) => setMatchForm({...matchForm, referee: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Programmer le match'}
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'news' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Créer un article</h2>
                <form onSubmit={handleCreateNews} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contenu *</label>
                    <textarea
                      required
                      rows={6}
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auteur *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.author}
                      onChange={(e) => setNewsForm({...newsForm, author: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL de l'image</label>
                    <input
                      type="url"
                      value={newsForm.image_url}
                      onChange={(e) => setNewsForm({...newsForm, image_url: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Publication...' : 'Publier l\'article'}
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'scores' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Saisir les résultats</h2>
                <div className="space-y-4">
                  {matches.filter(match => match.status === 'scheduled').map(match => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(match.match_date).toLocaleString('fr-FR')} - {match.venue}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="Domicile"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            id={`home-${match.id}`}
                          />
                          <span>-</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ext."
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            id={`away-${match.id}`}
                          />
                          <button
                            onClick={() => {
                              const homeScore = document.getElementById(`home-${match.id}`).value;
                              const awayScore = document.getElementById(`away-${match.id}`).value;
                              if (homeScore !== '' && awayScore !== '') {
                                handleUpdateMatchScore(match.id, homeScore, awayScore);
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Valider
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {matches.filter(match => match.status === 'scheduled').length === 0 && (
                    <p className="text-gray-500">Aucun match en attente de résultat</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'matches':
        return <MatchesPage />;
      case 'rankings':
        return <RankingsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'news':
        return <NewsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;