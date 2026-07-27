import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const apiKey = body.apiKey ? String(body.apiKey).trim() : null;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { customApiKey: apiKey },
      select: { id: true, credits: true, customApiKey: true }
    });

    return NextResponse.json({
      success: true,
      customApiKey: updatedUser.customApiKey,
    });
  } catch (error) {
    console.error("Error updating custom API key:", error);
    return NextResponse.json({ error: error.message || "Failed to update API key" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { customApiKey: null }
    });

    return NextResponse.json({ success: true, customApiKey: null });
  } catch (error) {
    console.error("Error clearing custom API key:", error);
    return NextResponse.json({ error: error.message || "Failed to remove API key" }, { status: 500 });
  }
}
