/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
  const email = 'admin@example.com'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      role: 'ADMIN',
      passwordHash: hashedPassword,
      name: 'Admin User',
    },
  })

  console.log(`✅ Admin user ready: ${admin.email}`)
}

async function main() {
  await seedAdmin()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
