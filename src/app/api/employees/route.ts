import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  documentId: z.string().optional(),
  position: z.string().optional(),
  baseSalary: z.number().optional(),
  startDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            notes: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        documentId: validatedData.documentId || null,
        position: validatedData.position || null,
        baseSalary: validatedData.baseSalary || null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
