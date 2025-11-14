import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

const createSellerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

function generatePassword(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase();
  const randomDigits = Math.floor(Math.random() * 90 + 10); // 10-99
  return `${firstName}${randomDigits}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sellers = await prisma.seller.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSellerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    const generatedPassword = generatePassword(validatedData.name);
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          role: 'SELLER',
          passwordHash,
        },
      });

      const seller = await tx.seller.create({
        data: {
          name: validatedData.name,
          phone: validatedData.phone,
          email: validatedData.email,
          userId: user.id,
          commissionRate: validatedData.commissionRate || 0,
          notes: validatedData.notes,
        },
      });

      return { seller, user, generatedPassword };
    });

    return NextResponse.json({
      seller: result.seller,
      credentials: {
        email: result.user.email,
        password: result.generatedPassword,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating seller:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create seller';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
