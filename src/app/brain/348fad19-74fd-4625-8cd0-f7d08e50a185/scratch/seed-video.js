const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.upsert({
    where: { slug: 'huong-dan-goi-qua-xinh-xan-tai-tinori' },
    update: {
      videoUrl: 'https://www.youtube.com/watch?v=EttASPzaNn4&list=RDEttASPzaNn4&start_radio=1'
    },
    create: {
      title: 'Hướng dẫn gói quà xinh xắn tại Tinori Shop 🎀',
      slug: 'huong-dan-goi-qua-xinh-xan-tai-tinori',
      content: 'Chào cậu, chúng mình là Tinori Shop đây!\n\nNgoài những món đồ xinh xắn, tụi mình còn có dịch vụ gói quà siêu tâm đắc dành cho những dịp đặc biệt của bạn. Video này sẽ cho bạn thấy quy trình tụi mình chăm chút cho từng hộp quà như thế nào nhé.\n\nHy vọng cậu sẽ thích dịch vụ mới này!',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=EttASPzaNn4&list=RDEttASPzaNn4&start_radio=1',
      active: true,
    }
  });
  console.log('Created/Updated post:', post);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
