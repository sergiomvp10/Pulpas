'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, TrendingUp, Users, DollarSign, Flag, Plus, Loader2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  goalType: 'SALES_COUNT' | 'SALES_AMOUNT' | 'NEW_CUSTOMERS';
  startDate: string;
  endDate: string;
  isCompleted: boolean;
}

interface Stats {
  salesCount: number;
  salesTotal: number;
  newCustomers: number;
  currentMonth: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function ProgressBar({ current, target, showFlag = true }: { current: number; target: number; showFlag?: boolean }) {
  const percentage = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <div className="relative w-full">
      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showFlag && (
        <div className="absolute right-0 -top-1 transform translate-x-1/2">
          <Flag
            className={`h-8 w-8 ${isCompleted ? 'text-green-600 fill-green-600' : 'text-gray-400'}`}
          />
        </div>
      )}
      <div className="flex justify-between mt-1 text-sm text-gray-600">
        <span>{current}</span>
        <span className="font-medium">{Math.round(percentage)}%</span>
        <span>{target}</span>
      </div>
    </div>
  );
}

function GoalCard({ goal, stats }: { goal: Goal; stats: Stats }) {
  let currentValue = 0;
  let displayValue = '';
  let targetDisplay = '';

  switch (goal.goalType) {
    case 'SALES_COUNT':
      currentValue = stats.salesCount;
      displayValue = `${currentValue} ventas`;
      targetDisplay = `${goal.targetValue} ventas`;
      break;
    case 'SALES_AMOUNT':
      currentValue = stats.salesTotal;
      displayValue = formatCurrency(currentValue);
      targetDisplay = formatCurrency(goal.targetValue);
      break;
    case 'NEW_CUSTOMERS':
      currentValue = stats.newCustomers;
      displayValue = `${currentValue} clientes`;
      targetDisplay = `${goal.targetValue} clientes`;
      break;
  }

  const isCompleted = currentValue >= goal.targetValue;
  const endDate = new Date(goal.endDate);
  const isExpired = endDate < new Date();

  return (
    <Card className={isCompleted ? 'border-green-500 bg-green-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              {goal.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Meta: {targetDisplay}
            </p>
          </div>
          {isCompleted ? (
            <Badge className="bg-green-500">Completada</Badge>
          ) : isExpired ? (
            <Badge variant="destructive">Expirada</Badge>
          ) : (
            <Badge variant="outline">En progreso</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-green-600 mb-2">{displayValue}</p>
            <ProgressBar
              current={goal.goalType === 'SALES_AMOUNT' ? currentValue / 100 : currentValue}
              target={goal.goalType === 'SALES_AMOUNT' ? goal.targetValue / 100 : goal.targetValue}
            />
          </div>
          <p className="text-xs text-gray-500">
            Fecha límite: {new Date(goal.endDate).toLocaleDateString('es-CO')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyProgressPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    targetValue: string;
    goalType: 'SALES_COUNT' | 'SALES_AMOUNT' | 'NEW_CUSTOMERS';
    startDate: string;
    endDate: string;
  }>({
    title: '',
    targetValue: '',
    goalType: 'SALES_COUNT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/seller-goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetValue) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/seller-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          targetValue: newGoal.goalType === 'SALES_AMOUNT' 
            ? parseInt(newGoal.targetValue) * 100 
            : parseInt(newGoal.targetValue),
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setNewGoal({
          title: '',
          targetValue: '',
          goalType: 'SALES_COUNT',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Cargando progreso...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Progreso</h1>
          <p className="text-gray-500">
            {stats?.currentMonth ? `Resumen de ${stats.currentMonth}` : 'Tu rendimiento este mes'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre de la meta</Label>
                <Input
                  id="title"
                  placeholder="Ej: Vender 50 unidades"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalType">Tipo de meta</Label>
                <Select
                  value={newGoal.goalType}
                  onValueChange={(value: 'SALES_COUNT' | 'SALES_AMOUNT' | 'NEW_CUSTOMERS') =>
                    setNewGoal({ ...newGoal, goalType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES_COUNT">Cantidad de ventas</SelectItem>
                    <SelectItem value="SALES_AMOUNT">Monto de ventas (COP)</SelectItem>
                    <SelectItem value="NEW_CUSTOMERS">Nuevos clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetValue">
                  {newGoal.goalType === 'SALES_AMOUNT' ? 'Monto objetivo (COP)' : 'Cantidad objetivo'}
                </Label>
                <Input
                  id="targetValue"
                  type="number"
                  placeholder={newGoal.goalType === 'SALES_AMOUNT' ? '1000000' : '50'}
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha límite</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateGoal} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Meta'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.salesCount}</div>
              <p className="text-xs text-gray-500">ventas completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.salesTotal)}</div>
              <p className="text-xs text-gray-500">este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newCustomers}</div>
              <p className="text-xs text-gray-500">registrados por ti</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Mis Metas</h2>
        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                No tienes metas creadas. Crea una meta para empezar a trackear tu progreso.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} stats={stats!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
