import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { TITLES } from "@/types/gamification";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardUser {
  id: string;
  full_name: string | null;
  email: string;
  total_points: number;
}

export const LeaderboardPanel = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  useEffect(() => {
    console.log('🚀 LeaderboardPanel montado, resetando estado...');
    // Reset state on mount
    setLoading(true);
    setError(null);
    setHasLoaded(false);
    setCurrentUserId(null);
    setIsLoadingRef(false);

    console.log('🔄 Iniciando carregamento...');
    loadLeaderboard();
    getCurrentUser();
  }, []);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      console.log('🏁 LeaderboardPanel desmontado');
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      console.log('👤 Obtendo usuário atual...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('✅ Usuário atual:', user.email);
        setCurrentUserId(user.id);
      } else {
        console.log('⚠️ Nenhum usuário logado');
      }
    } catch (err) {
      console.error('❌ Erro ao obter usuário atual:', err);
    }
  };

  const calculateStreak = (completionHistory: string[]): number => {
    if (!completionHistory || completionHistory.length === 0) return 0;

    const sortedDates = completionHistory
      .map(date => new Date(date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 24 * 60 * 60 * 1000;

    // Se não completou hoje nem ontem, streak é 0
    if (sortedDates[0] < yesterday) return 0;

    let streak = 0;
    let currentDate = sortedDates[0] === today ? today : yesterday;

    for (const completionDate of sortedDates) {
      if (completionDate === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000;
      } else if (completionDate < currentDate) {
        break;
      }
    }

    return streak;
  };

  const calculateHabitPoints = (streak: number): number => {
    if (streak === 0) return 0;

    const bonuses = [
      { days: 30, points: 60 },
      { days: 21, points: 50 },
      { days: 14, points: 40 },
      { days: 7, points: 34 },
      { days: 5, points: 30 },
      { days: 4, points: 26 },
      { days: 3, points: 24 },
      { days: 2, points: 22 },
      { days: 1, points: 20 },
    ];

    for (const bonus of bonuses) {
      if (streak >= bonus.days) {
        return bonus.points;
      }
    }

    return 20;
  };

  const loadLeaderboard = async () => {
    if (isLoadingRef) {
      console.log('⚠️ Já está carregando, ignorando chamada duplicada');
      return;
    }

    try {
      setIsLoadingRef(true);
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando leaderboard...');

      // Timeout para evitar carregamento infinito
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: carregamento demorou mais de 10 segundos')), 10000);
      });

      const leaderboardPromise = async () => {
        // Buscar todos os perfis
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('created_at');

        console.log('📊 Profiles encontrados:', profiles?.length || 0);
        if (profilesError) {
          console.error('❌ Erro ao buscar profiles:', profilesError);
          throw new Error(`Erro ao buscar profiles: ${profilesError.message}`);
        }

        if (!profiles || profiles.length === 0) {
          console.warn('⚠️ Nenhum profile encontrado');
          return [];
        }

        // Para cada usuário, calcular pontos totais
        const usersWithPoints = await Promise.all(
          profiles.map(async (profile) => {
            console.log(`🔍 Calculando pontos para ${profile.email}...`);

            try {
              // Buscar todos os hábitos do usuário com completion_history
              const { data: habits, error: habitsError } = await supabase
                .from('habits')
                .select('id, completion_history')
                .eq('user_id', profile.id);

              if (habitsError) {
                console.error(`❌ Erro ao buscar hábitos de ${profile.email}:`, habitsError);
                return {
                  ...profile,
                  total_points: 0
                };
              }

              if (!habits || habits.length === 0) {
                console.log(`ℹ️ ${profile.email} não tem hábitos`);
                return {
                  ...profile,
                  total_points: 0
                };
              }

              // Calcular pontos baseado no total de conclusões (não no streak atual)
              let totalPoints = 0;
              habits.forEach((habit: any) => {
                const completions = habit.completion_history?.length || 0;
                totalPoints += completions * 20; // 20 pontos por conclusão
              });

              console.log(`✅ ${profile.email}: ${totalPoints} pontos (${habits.length} hábitos)`);

              return {
                ...profile,
                total_points: totalPoints
              };
            } catch (habitError) {
              console.error(`💥 Erro ao processar hábitos de ${profile.email}:`, habitError);
              return {
                ...profile,
                total_points: 0
              };
            }
          })
        );

        // Ordenar por pontos (decrescente)
        const sortedUsers = usersWithPoints.sort((a, b) => b.total_points - a.total_points);

        console.log('🏆 Leaderboard carregado:', sortedUsers.length, 'usuários');
        return sortedUsers;
      };

      // Executar com timeout
      const sortedUsers = await Promise.race([leaderboardPromise(), timeoutPromise]);

      setUsers(sortedUsers as LeaderboardUser[]);
      setHasLoaded(true);
    } catch (error: any) {
      console.error('💥 Erro ao carregar leaderboard:', error);
      setError(error.message || 'Erro desconhecido ao carregar leaderboard');
      setUsers([]);
      setHasLoaded(true);
    } finally {
      setLoading(false);
      setIsLoadingRef(false);
    }
  };

  const getUserTitle = (points: number) => {
    for (let i = TITLES.length - 1; i >= 0; i--) {
      if (points >= TITLES[i].minPoints) {
        return TITLES[i];
      }
    }
    return TITLES[0];
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando ranking...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <Trophy className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-red-600 mb-2">Erro ao carregar ranking</p>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking Global
          </CardTitle>
          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Atualizar ranking"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {users.map((user, index) => {
              const title = getUserTitle(user.total_points);
              const isCurrentUser = user.id === currentUserId;

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                    isCurrentUser
                      ? 'bg-amber-50 border-2 border-amber-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Posição e Medalha */}
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    {getMedalIcon(index) || <span className="text-gray-600 font-semibold text-sm">#{index + 1}</span>}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-semibold">
                      {getInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Nome e Título */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-tight ${isCurrentUser ? 'text-amber-900' : 'text-gray-900'}`}>
                      {user.full_name || user.email.split('@')[0]}
                      {isCurrentUser && <span className="ml-1 text-xs font-normal">(Você)</span>}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">{title.icon}</span>
                      <span className="text-xs text-gray-600">{title.name}</span>
                    </div>
                  </div>

                  {/* Pontos */}
                  <div className="flex-shrink-0 ml-2">
                    <Badge 
                      variant={isCurrentUser ? "default" : "secondary"} 
                      className="font-bold text-xs px-2.5 py-1 whitespace-nowrap"
                    >
                      {user.total_points.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum usuário encontrado</p>
                <p className="text-xs mt-2">Verifique as configurações de RLS no Supabase</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
