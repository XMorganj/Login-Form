const express = require('express');
const Celebrity = require('../models/Celebrity');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ── Sample data ──────────────────────────────────────────────────────────────

const CELEBRITIES = [
  // ── Music ──
  {
    name: 'Taylor Swift', slug: 'taylor-swift', category: 'music', nationality: 'American', featured: true,
    shortBio: 'Grammy-winning pop & country icon with record-breaking world tours.',
    bio: 'Taylor Alison Swift is an American singer-songwriter whose narrative songwriting—drawing on her personal experiences—has earned her critical acclaim and a fiercely devoted global fan base. She has won 14 Grammy Awards, broken numerous concert attendance records, and her Eras Tour became one of the highest-grossing music tours in history. Her genre-spanning discography includes country, pop, indie folk and alternative albums that have each defined an era of modern music.'
  },
  {
    name: 'Drake', slug: 'drake', category: 'music', nationality: 'Canadian', featured: true,
    shortBio: 'Hip-hop superstar, OVO founder, and one of the best-selling artists of all time.',
    bio: 'Aubrey Drake Graham, known professionally as Drake, is a Canadian rapper, singer, and actor from Toronto, Ontario. After rising to fame on the teen drama Degrassi, he launched a music career that would make him one of the best-selling music artists of all time. He founded OVO Sound record label and OVO Fest, and holds multiple Billboard chart records. His introspective lyrics and genre-blending style have shaped the sound of modern hip-hop and R&B.'
  },
  {
    name: 'Beyoncé', slug: 'beyonce', category: 'music', nationality: 'American', featured: true,
    shortBio: 'Queen Bey — cultural icon, record-breaking solo artist and Destiny\'s Child star.',
    bio: 'Beyoncé Giselle Knowles-Carter is an American singer, songwriter, actress and businesswoman. Widely regarded as one of the greatest entertainers of all time, she rose to fame as the lead singer of Destiny\'s Child before launching a massively successful solo career. She has won 32 Grammy Awards—the most of any artist in history—and her visual albums Lemonade and Renaissance are landmark works of contemporary music and Black culture.'
  },
  {
    name: 'Ed Sheeran', slug: 'ed-sheeran', category: 'music', nationality: 'British', featured: false,
    shortBio: 'Shape of You singer-songwriter with over 150 million albums sold worldwide.',
    bio: 'Edward Christopher Sheeran is an English singer-songwriter who has sold more than 150 million records worldwide. Known for his intimate acoustic performances and emotionally resonant lyrics, Sheeran has topped charts in over 30 countries. His albums include Plus, Multiply, Divide and Equals. He frequently collaborates with other artists across genres and is famous for performing his world tours almost entirely solo on stage with just a guitar and loop pedal.'
  },
  {
    name: 'Rihanna', slug: 'rihanna', category: 'music', nationality: 'Barbadian', featured: true,
    shortBio: 'Pop & R&B icon, Fenty Beauty founder, and Super Bowl headliner.',
    bio: 'Robyn Rihanna Fenty is a Barbadian singer, actress, and businesswoman who emerged as one of the world\'s best-selling music artists with hits spanning pop, dancehall, and R&B. With over 250 million records sold, she is one of the best-selling music artists of all time. Beyond music, she disrupted the beauty industry with her inclusive Fenty Beauty line and launched Savage X Fenty lingerie. Her 2023 Super Bowl halftime performance drew over 118 million viewers.'
  },
  {
    name: 'Bad Bunny', slug: 'bad-bunny', category: 'music', nationality: 'Puerto Rican', featured: false,
    shortBio: 'Latin trap & reggaeton superstar — most-streamed artist on Spotify multiple years running.',
    bio: 'Benito Antonio Martínez Ocasio, known as Bad Bunny, is a Puerto Rican rapper and singer who became the first non-English-language artist to top the Spotify year-end chart. His innovative blend of Latin trap, reggaeton, and experimental sounds has redefined global music trends. He has headlined Coachella, starred in films and TV, and his albums Un Verano Sin Ti and Nadie Sabe Lo Que Va a Pasar Mañana broke streaming records worldwide.'
  },

  // ── Film ──
  {
    name: 'Dwayne Johnson', slug: 'dwayne-johnson', category: 'film', nationality: 'American', featured: true,
    shortBio: 'The Rock — WWE legend turned Hollywood\'s highest-paid actor.',
    bio: 'Dwayne Douglas Johnson, widely known by his ring name The Rock, is an American actor, businessman, and former professional wrestler. After a celebrated career in the WWE, he transitioned into Hollywood where he became one of the highest-paid and most bankable actors in the world. His films—including the Fast & Furious franchise, Jumanji, and Black Adam—have collectively grossed billions at the global box office. He is also the co-founder of Teremana Tequila and ZOA Energy.'
  },
  {
    name: 'Scarlett Johansson', slug: 'scarlett-johansson', category: 'film', nationality: 'American', featured: false,
    shortBio: 'Marvel\'s Black Widow and one of the highest-grossing actresses in cinema history.',
    bio: 'Scarlett Ingrid Johansson is an American actress and singer who began her career as a child actor before becoming one of the most recognisable faces in Hollywood. Best known for her role as Natasha Romanoff / Black Widow in the Marvel Cinematic Universe, she has also earned critical acclaim for her work in Marriage Story, Her, and Lost in Translation. She has been the world\'s highest-paid actress multiple times and is a producer through her production company These Pictures.'
  },
  {
    name: 'Leonardo DiCaprio', slug: 'leonardo-dicaprio', category: 'film', nationality: 'American', featured: false,
    shortBio: 'Oscar-winning actor and passionate environmentalist behind The Revenant and Titanic.',
    bio: 'Leonardo Wilhelm DiCaprio is an American actor and film producer known for his roles in biographical and period films. After a breakthrough role in Titanic (1997), he built one of the most celebrated careers in Hollywood, earning Academy Award nominations for The Aviator, Blood Diamond, The Wolf of Wall Street, and winning his first Oscar for The Revenant. He is also a prominent environmental activist and operates the Leonardo DiCaprio Foundation for conservation.'
  },

  // ── Sports ──
  {
    name: 'Cristiano Ronaldo', slug: 'cristiano-ronaldo', category: 'sports', nationality: 'Portuguese', featured: true,
    shortBio: 'CR7 — five-time Ballon d\'Or winner and all-time international top scorer.',
    bio: 'Cristiano Ronaldo dos Santos Aveiro, known as CR7, is a Portuguese professional footballer widely regarded as one of the greatest players of all time. He has won five UEFA Champions League titles, five Ballon d\'Or awards, and is the all-time top scorer in men\'s international football. He has played for Sporting CP, Manchester United, Real Madrid, Juventus, and Al Nassr. Off the pitch, his CR7 brand spans fashion, hotels, fragrance, and a dedicated worldwide fan base of hundreds of millions.'
  },
  {
    name: 'LeBron James', slug: 'lebron-james', category: 'sports', nationality: 'American', featured: true,
    shortBio: 'King James — 4x NBA champion, all-time NBA scoring leader, and businessman.',
    bio: 'LeBron Raymone James Sr., nicknamed King James, is an American professional basketball player for the Los Angeles Lakers. Widely considered one of the greatest basketball players of all time, he is the all-time leading scorer in NBA history. He has won four NBA championships with three different teams, earned four NBA Finals MVP awards, and represented the United States in the Olympics. Beyond basketball, he co-founded SpringHill Entertainment and is the first active NBA player to achieve billionaire status.'
  },
  {
    name: 'Serena Williams', slug: 'serena-williams', category: 'sports', nationality: 'American', featured: false,
    shortBio: '23-time Grand Slam champion and one of the greatest athletes in history.',
    bio: 'Serena Jameka Williams is a former American professional tennis player who is widely regarded as one of the greatest athletes of all time. She won 23 Grand Slam singles titles—the most by any player in the Open Era—and held the world No. 1 ranking for a record 319 weeks. After retiring from professional tennis in 2022, she became a venture capital investor through Serena Ventures and continues to inspire millions as a mother, entrepreneur, and cultural icon.'
  },
  {
    name: 'Lionel Messi', slug: 'lionel-messi', category: 'sports', nationality: 'Argentine', featured: true,
    shortBio: 'La Pulga — 8x Ballon d\'Or winner and 2022 FIFA World Cup champion with Argentina.',
    bio: 'Lionel Andrés Messi, known as La Pulga (The Flea), is an Argentine professional footballer universally considered one of the greatest players in football history. He spent 21 years at FC Barcelona before joining Paris Saint-Germain and then Inter Miami CF. He has won 8 Ballon d\'Or awards—more than any player in history—and led Argentina to their historic 2022 FIFA World Cup triumph. His 91 goals in a calendar year and over 800 career club goals are world records.'
  },

  // ── TV ──
  {
    name: 'Oprah Winfrey', slug: 'oprah-winfrey', category: 'tv', nationality: 'American', featured: false,
    shortBio: 'Legendary TV host, media mogul, philanthropist, and cultural icon.',
    bio: 'Oprah Gail Winfrey is an American talk show host, television producer, actress, author, and media proprietor. Her talk show, The Oprah Winfrey Show, was the highest-rated television program of its kind in history and ran for 25 years. She has been ranked the richest African-American and the greatest Black philanthropist in American history. Through her OWN network, book club, and numerous charitable initiatives, she continues to influence culture and inspire millions worldwide.'
  },
  {
    name: 'Kim Kardashian', slug: 'kim-kardashian', category: 'tv', nationality: 'American', featured: false,
    shortBio: 'Reality TV star, SKIMS founder, and billionaire entrepreneur.',
    bio: 'Kimberly Noel Kardashian is an American media personality, socialite, and businesswoman who rose to fame through the reality TV series Keeping Up with the Kardashians. She has built a business empire including SKIMS shapewear—now valued at over $4 billion—and SKKN BY KIM skincare. She is also a criminal justice reform advocate and is studying to become a lawyer. Forbes recognised her as a billionaire in 2021, and she remains one of the most-followed people on social media worldwide.'
  },

  // ── Other ──
  {
    name: 'MrBeast', slug: 'mrbeast', category: 'other', nationality: 'American', featured: true,
    shortBio: 'World\'s most-subscribed YouTuber, known for massive challenges and philanthropy.',
    bio: 'Jimmy Donaldson, known online as MrBeast, is an American YouTuber, philanthropist, and entrepreneur. He is the most-subscribed individual creator on YouTube with over 300 million subscribers. Known for his elaborate challenges, large-scale stunts, and viral philanthropy videos, he has given away millions of dollars to fans and charities. He founded MrBeast Burger, Feastables chocolate, and Beast Philanthropy—a dedicated charity channel that feeds and houses thousands of people annually.'
  }
];

function makeProducts(celeb) {
  const id = celeb._id;
  return [
    {
      name: `${celeb.name} Fan Card`,
      description: `A beautifully designed digital fan card featuring ${celeb.name}. Collect it, share it, and show the world who your favourite star is. Delivered instantly to your email as a high-resolution digital card.`,
      price: 4.99, celebrity: id, category: 'digital', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Digital Gift Card — $25`,
      description: `Send a $25 fan gift card in ${celeb.name}'s name. A perfect way to show your support. The gift card can be redeemed for any item in the ${celeb.name} collection on StarGifts.`,
      price: 25.00, celebrity: id, category: 'donation', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Digital Gift Card — $50`,
      description: `Send a $50 fan gift card in ${celeb.name}'s name. A great gift for fellow fans or a generous way to show your love and support for ${celeb.name}.`,
      price: 50.00, celebrity: id, category: 'donation', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Digital Gift Card — $100`,
      description: `Send a premium $100 fan gift card in ${celeb.name}'s name. The ultimate fan gift, perfect for birthdays, holidays, or any special occasion.`,
      price: 100.00, celebrity: id, category: 'donation', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Signed Photo Print`,
      description: `A high-quality A4 printed photograph of ${celeb.name} featuring a printed signature. Delivered in a protective sleeve with a certificate of authenticity. A must-have for every serious fan.`,
      price: 19.99, celebrity: id, category: 'merchandise', stock: 150
    },
    {
      name: `${celeb.name} Official Fan T-Shirt`,
      description: `Show your love with this premium 100% cotton fan T-shirt. Features an exclusive ${celeb.name} graphic print. Available in sizes S–3XL. Soft-washed for a relaxed, comfortable fit.`,
      price: 29.99, celebrity: id, category: 'merchandise', stock: 300
    },
    {
      name: `${celeb.name} Signed Poster (A3)`,
      description: `A large A3 glossy poster of ${celeb.name} with a printed signature and gold foil star border. Frame it and make it the centrepiece of any fan's room. Ships worldwide in a rigid tube.`,
      price: 34.99, celebrity: id, category: 'merchandise', stock: 100
    },
    {
      name: `${celeb.name} Fan Hoodie`,
      description: `A cosy, heavyweight fan hoodie featuring an exclusive ${celeb.name} design on the chest and back. Perfect for concerts, casual wear, or gifting. Pre-shrunk fleece, unisex fit, sizes S–3XL.`,
      price: 54.99, celebrity: id, category: 'merchandise', stock: 200
    },
    {
      name: `${celeb.name} Digital Wallpaper Pack`,
      description: `A collection of 20 stunning high-resolution digital wallpapers featuring ${celeb.name}. Optimised for desktop, mobile, and tablet. Download instantly after purchase and make every screen a tribute.`,
      price: 7.99, celebrity: id, category: 'digital', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Birthday Shoutout`,
      description: `Arrange an exclusive personalised birthday shoutout in ${celeb.name}'s style — a heartfelt video message delivered to your inbox in 3–5 business days. Perfect gift to surprise a superfan.`,
      price: 49.99, celebrity: id, category: 'experience', stock: 50
    },
    {
      name: `${celeb.name} Personalised Video Message`,
      description: `Request a personal video message from ${celeb.name}'s team for any occasion — birthday, anniversary, graduation, or just to say hello. Delivered as a shareable digital file within 5 business days.`,
      price: 149.99, celebrity: id, category: 'experience', stock: 20
    },
    {
      name: `${celeb.name} VIP Meet & Greet Pass`,
      description: `The ultimate fan experience — a VIP Meet & Greet pass that grants backstage or exclusive access to meet ${celeb.name} at a selected event. Includes a photo opportunity, signed memorabilia, and a premium fan gift bag.`,
      price: 349.99, celebrity: id, category: 'experience', stock: 5
    },
    {
      name: `Charity Donation in ${celeb.name}'s Name`,
      description: `Make a charitable donation of $35 in ${celeb.name}'s name to a cause close to their heart. You'll receive a personalised digital certificate to share, showing your contribution in honour of ${celeb.name}.`,
      price: 35.00, celebrity: id, category: 'donation', unlimited: true, stock: 0
    },
    {
      name: `${celeb.name} Collector's Bundle`,
      description: `The ultimate fan bundle: includes a signed photo print, an official fan T-shirt, a digital wallpaper pack, and a fan card — all in one discounted bundle. Ships in premium branded packaging. Limited stock.`,
      price: 69.99, celebrity: id, category: 'merchandise', stock: 40
    }
  ];
}

// ── Seed route ───────────────────────────────────────────────────────────────

router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    let celebsCreated = 0, productsCreated = 0, skipped = 0;

    for (const data of CELEBRITIES) {
      let celeb = await Celebrity.findOne({ slug: data.slug });
      if (!celeb) {
        celeb = await Celebrity.create(data);
        celebsCreated++;
      } else {
        skipped++;
        continue;
      }

      const products = makeProducts(celeb);
      for (const p of products) {
        const exists = await Product.findOne({ celebrity: celeb._id, name: p.name });
        if (!exists) { await Product.create(p); productsCreated++; }
      }
    }

    res.json({
      message: `Seed complete — ${celebsCreated} celebrities and ${productsCreated} products created (${skipped} celebrities already existed).`,
      celebsCreated, productsCreated, skipped
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
