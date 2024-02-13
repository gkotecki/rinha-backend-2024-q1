import { Database } from 'bun:sqlite'
const db = new Database('rinha.sqlite', { create: true })

db.run(`
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS transacoes;
`)

db.run(`
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total INTEGER NOT NULL,
  limite integer NOT NULL
);

CREATE TABLE transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  valor INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  realizada_em TEXT NOT NULL
);

INSERT INTO clientes
  (total, limite)
VALUES
  (0, 100000),
  (0, 80000),
  (0, 1000000),
  (0, 10000000),
  (0, 500000);
`)

type Customer = {
  id: number
  total: number
  limite: string
}

type Transaction = {
  id: number
  cliente_id: number
  valor: number
  tipo: 'c' | 'd'
  descricao: string
  realizada_em: string
}

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/') {
      const data = JSON.stringify({ message: 'Hello, home page!' })
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const frags = url.pathname.split('/')

    if (frags.at(-1) === 'extrato') {
      const id = frags.at(-2) || '0'
      const customer = db.query('SELECT * FROM clientes WHERE id = ?').get(id) as Customer
      if (!customer) {
        return new Response('{}', {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const lastTransactions = db
        .query('SELECT * FROM transacoes WHERE cliente_id = ? ORDER BY realizada_em DESC LIMIT 10')
        .all(id) as Transaction[]
      const data = JSON.stringify({
        saldo: {
          total: customer.total,
          data_extrato: new Date().toJSON(),
          limite: customer.limite,
        },
        ultimas_transacoes: lastTransactions.map(({ id, cliente_id, ...data }) => data),
      })
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (frags.at(-1) === 'transacoes') {
      const id = frags.at(-2)
      const data = JSON.stringify({ message: 'Hello, transacoes!', id })
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('404!')
  },
})
