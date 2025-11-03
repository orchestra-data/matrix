import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  GraduationCap, 
  GitBranch, 
  BookOpen, 
  Layers,
  FileText,
  TrendingUp,
  Users,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: containers } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.Container.list(),
    initialData: [],
  });

  const { data: pathways } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => base44.entities.Pathway.list(),
    initialData: [],
  });

  const { data: series } = useQuery({
    queryKey: ['series'],
    queryFn: () => base44.entities.Series.list(),
    initialData: [],
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
    initialData: [],
  });

  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: () => base44.entities.Component.list(),
    initialData: [],
  });

  const stats = [
    {
      title: "Containers",
      value: containers.length,
      icon: GraduationCap,
      color: "from-purple-600 to-purple-400",
      bgColor: "from-purple-50 to-purple-100",
      link: createPageUrl("Containers"),
      description: "Cursos ativos"
    },
    {
      title: "Pathways",
      value: pathways.length,
      icon: GitBranch,
      color: "from-blue-600 to-blue-400",
      bgColor: "from-blue-50 to-blue-100",
      link: createPageUrl("Containers"),
      description: "Trilhas criadas"
    },
    {
      title: "Disciplinas",
      value: series.length,
      icon: BookOpen,
      color: "from-green-600 to-green-400",
      bgColor: "from-green-50 to-green-100",
      link: createPageUrl("Series"),
      description: "Series ativas"
    },
    {
      title: "Módulos",
      value: units.length,
      icon: Layers,
      color: "from-orange-600 to-orange-400",
      bgColor: "from-orange-50 to-orange-100",
      link: createPageUrl("Series"),
      description: "Units criadas"
    },
    {
      title: "Componentes",
      value: components.length,
      icon: FileText,
      color: "from-pink-600 to-pink-400",
      bgColor: "from-pink-50 to-pink-100",
      link: createPageUrl("Components"),
      description: "Conteúdos disponíveis"
    },
    {
      title: "Total de Horas",
      value: series.reduce((acc, s) => acc + (s.duracao_horas || 0), 0),
      icon: Award,
      color: "from-indigo-600 to-indigo-400",
      bgColor: "from-indigo-50 to-indigo-100",
      description: "Carga horária"
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard Acadêmico
        </h1>
        <p className="text-slate-600">
          Visão geral do sistema de gestão de conteúdos universitários
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link || "#"}>
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm cursor-pointer overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <CardTitle className={`text-4xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-white">
              <GraduationCap className="w-6 h-6" />
              Hierarquia do Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="text-white/90 text-sm">
              Estrutura hierárquica completa do sistema:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Container → Curso/Graduação
              </div>
              <div className="flex items-center gap-2 text-white/80 pl-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Pathway → Trilha/Período
              </div>
              <div className="flex items-center gap-2 text-white/80 pl-8">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Series → Disciplina
              </div>
              <div className="flex items-center gap-2 text-white/80 pl-12">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Unit → Módulo/Sessão
              </div>
              <div className="flex items-center gap-2 text-white/80 pl-16">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Component → Conteúdo/UA
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="w-6 h-6 text-purple-600" />
              Últimos Containers Criados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {containers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum container criado ainda</p>
                <Link 
                  to={createPageUrl("Containers")}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 inline-block"
                >
                  Criar primeiro container →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {containers.slice(0, 5).map((container) => (
                  <Link
                    key={container.id}
                    to={createPageUrl("Containers")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                      {container.nome?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {container.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {container.codigo_unico}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      container.status === 'ativo' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {container.status}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}