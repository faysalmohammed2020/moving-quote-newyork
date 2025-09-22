/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { postdata } from '../app/(main)/data/postdata'

const prisma = new PrismaClient()

// JSON helper
const jsonOrNull = (v: unknown) => {
  if (v === undefined || v === null) return Prisma.DbNull
  return v
}

// Date helper
const parseDate = (d: string | null | undefined): Date | null => {
  if (!d) return null
  return new Date(String(d).replace(' ', 'T'))
}

async function seedAdmin() {
  const email = 'admin@example.com'
  const password = 'admin123' 
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
    },
    create: {
      email,
      role: 'ADMIN',
      passwordHash: hashedPassword,
      name: 'Admin User',
    },
  })

  console.log(`✅ Admin user ready: ${admin.email}`)
}

async function seedBlogPosts() {
  console.log(`🌱 Seeding BlogPost… Total posts: ${postdata.length}`)

  let created = 0
  let updated = 0

  for (const p of postdata as any[]) {
    const data = {
      post_author: p.post_author ? Number(p.post_author) : null,
      tags: p.tags ? String(p.tags) : null,
      name: p.name ? String(p.name) : null,
      category: p.category
        ? (typeof p.category === 'string'
            ? p.category
            : p.category?.name ?? p.category?.label ?? p.category?.value ?? null)
        : null,
      post_date: parseDate(p.post_date),
      post_date_gmt: parseDate(p.post_date_gmt),
      post_content: jsonOrNull(p.post_content),
      post_title: String(p.post_title ?? ''),
      post_excerpt: p.post_excerpt ? String(p.post_excerpt) : null,
      post_status: p.post_status ? String(p.post_status) : null,
      comment_status: p.comment_status ? String(p.comment_status) : null,
      ping_status: p.ping_status ? String(p.ping_status) : null,
      post_password: p.post_password ? String(p.post_password) : null,
      post_name: String(p.post_name ?? p.post_title ?? ''),
      to_ping: p.to_ping ? String(p.to_ping) : null,
      pinged: p.pinged ? String(p.pinged) : null,
      post_modified: parseDate(p.post_modified),
      post_modified_gmt: parseDate(p.post_modified_gmt),
      post_content_filtered: p.post_content_filtered ? String(p.post_content_filtered) : null,
      post_parent: p.post_parent ? Number(p.post_parent) : null,
      guid: p.guid ? String(p.guid) : null,
      menu_order: p.menu_order ? Number(p.menu_order) : null,
      post_type: p.post_type ? String(p.post_type) : null,
      post_mime_type: p.post_mime_type ? String(p.post_mime_type) : null,
      comment_count: p.comment_count ? Number(p.comment_count) : null,
      // createdAt: default(now())
    }

    const ors = [
      data.guid ? { guid: data.guid } : undefined,
      data.post_name ? { post_name: data.post_name } : undefined,
    ].filter(Boolean) as any[]

    const existing = ors.length
      ? await prisma.blogPost.findFirst({ where: { OR: ors } })
      : null

    if (existing) {
      await prisma.blogPost.update({
        where: { id: existing.id },
        data,
      })
      updated++
      console.log(`📝 Updated: ${data.post_title}`)
    } else {
      await prisma.blogPost.create({ data })
      created++
      console.log(`✅ Created: ${data.post_title}`)
    }
  }

  console.log(`🎉 BlogPost done. Created: ${created}, Updated: ${updated}`)
}

async function main() {
  await seedAdmin()
  await seedBlogPosts()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
