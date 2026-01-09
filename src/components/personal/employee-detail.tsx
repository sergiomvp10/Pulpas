'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, FileText, DollarSign, User, Calendar } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: Date | string;
  createdBy: { name: string };
}

interface Payment {
  id: string;
  type: string;
  amountCents: number;
  paymentDate: Date | string;
  paymentMethod: string;
  description?: string | null;
  createdAt: Date | string;
  createdBy: { name: string };
}

interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  documentId?: string | null;
  position?: string | null;
  baseSalary?: number | null;
  startDate?: Date | string | null;
  notes: Note[];
  payments: Payment[];
}

interface EmployeeDetailProps {
  employee: Employee;
}

const paymentTypeLabels: Record<string, string> = {
  SALARY: 'Salario',
  BONUS: 'Bonificación',
  ADVANCE: 'Adelanto',
  OTHER: 'Otro',
};

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  NEQUI: 'Nequi',
  BANCOLOMBIA: 'Bancolombia',
  CREDIT: 'Crédito',
};

export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(employee.notes);
  const [payments, setPayments] = useState<Payment[]>(employee.payments);
  
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'SALARY',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    description: '',
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(cents);
  };

  const formatDate = (dateValue: Date | string) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);

    try {
      const response = await fetch(`/api/employees/${employee.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.amount) return;
    setIsAddingPayment(true);

    try {
      const response = await fetch(`/api/employees/${employee.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: paymentForm.type,
          amountCents: parseInt(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description || undefined,
        }),
      });

      if (response.ok) {
        const payment = await response.json();
        setPayments([payment, ...payments]);
        setPaymentForm({
          type: 'SALARY',
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          description: '',
        });
        setShowPaymentForm(false);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}/payments?paymentId=${paymentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPayments(payments.filter((p) => p.id !== paymentId));
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
          <p className="text-gray-500">{employee.position || 'Sin cargo asignado'}</p>
        </div>
        <Link href={`/dashboard/personal/${employee.id}/edit`}>
          <Button variant="outline">Editar</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {employee.phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Teléfono:</span> {employee.phone}
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Email:</span> {employee.email}
              </div>
            )}
            {employee.documentId && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Documento:</span> {employee.documentId}
              </div>
            )}
            {employee.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Desde {formatDate(employee.startDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Salario Base</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {employee.baseSalary ? formatCurrency(employee.baseSalary) : 'No definido'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
            <p className="text-sm text-gray-500">{payments.length} pagos registrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas ({notes.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe una nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNote.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isAddingNote ? 'Agregando...' : 'Agregar Nota'}
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay notas registradas</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {note.createdBy.name} - {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pagos ({payments.length})
              </CardTitle>
              <Button size="sm" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Pago
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showPaymentForm && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={paymentForm.type}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALARY">Salario</SelectItem>
                        <SelectItem value="BONUS">Bonificación</SelectItem>
                        <SelectItem value="ADVANCE">Adelanto</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Monto (COP)</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha</Label>
                    <Input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Método</Label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Efectivo</SelectItem>
                        <SelectItem value="NEQUI">Nequi</SelectItem>
                        <SelectItem value="BANCOLOMBIA">Bancolombia</SelectItem>
                        <SelectItem value="CREDIT">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descripción (opcional)</Label>
                  <Input
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    placeholder="Descripción del pago"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddPayment}
                    disabled={isAddingPayment || !paymentForm.amount}
                  >
                    {isAddingPayment ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pagos registrados</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-600">
                            {formatCurrency(payment.amountCents)}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                            {paymentTypeLabels[payment.type] || payment.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(payment.paymentDate)} - {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}
                        </p>
                        {payment.description && (
                          <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-600"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Registrado por {payment.createdBy.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
