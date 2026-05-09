import { NextResponse } from "next/server"

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
}

export function badRequest(message = "Dados inválidos.") {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function tooManyRequests(message = "Muitas tentativas. Tente novamente em instantes.") {
  return NextResponse.json({ error: message }, { status: 429 })
}

export function serverError() {
  return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
}

