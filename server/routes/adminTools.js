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
    birthDate: new Date('1989-12-13'),
    shortBio: 'Grammy-winning pop & country icon with record-breaking world tours.',
    bio: 'Taylor Alison Swift is an American singer-songwriter whose narrative songwriting—drawing on her personal experiences—has earned her critical acclaim and a fiercely devoted global fan base. She has won 14 Grammy Awards, broken numerous concert attendance records, and her Eras Tour became one of the highest-grossing music tours in history. Her genre-spanning discography includes country, pop, indie folk and alternative albums that have each defined an era of modern music.',
    socialLinks: {
      instagram: 'https://www.instagram.com/taylorswift',
      twitter: 'https://twitter.com/taylorswift13',
      facebook: 'https://www.facebook.com/TaylorSwift',
      youtube: 'https://www.youtube.com/@taylorswift'
    }
  },
  {
    name: 'Drake', slug: 'drake', category: 'music', nationality: 'Canadian', featured: true,
    birthDate: new Date('1986-10-24'),
    shortBio: 'Hip-hop superstar, OVO founder, and one of the best-selling artists of all time.',
    bio: 'Aubrey Drake Graham, known professionally as Drake, is a Canadian rapper, singer, and actor from Toronto, Ontario. After rising to fame on the teen drama Degrassi, he launched a music career that would make him one of the best-selling music artists of all time. He founded OVO Sound record label and OVO Fest, and holds multiple Billboard chart records. His introspective lyrics and genre-blending style have shaped the sound of modern hip-hop and R&B.',
    socialLinks: {
      instagram: 'https://www.instagram.com/champagnepapi',
      twitter: 'https://twitter.com/Drake',
      facebook: 'https://www.facebook.com/Drake',
      youtube: 'https://www.youtube.com/@Drake'
    }
  },
  {
    name: 'Beyoncé', slug: 'beyonce', category: 'music', nationality: 'American', featured: true,
    birthDate: new Date('1981-09-04'),
    shortBio: 'Queen Bey — cultural icon, record-breaking solo artist and Destiny\'s Child star.',
    bio: 'Beyoncé Giselle Knowles-Carter is an American singer, songwriter, actress and businesswoman. Widely regarded as one of the greatest entertainers of all time, she rose to fame as the lead singer of Destiny\'s Child before launching a massively successful solo career. She has won 32 Grammy Awards—the most of any artist in history—and her visual albums Lemonade and Renaissance are landmark works of contemporary music and Black culture.',
    socialLinks: {
      instagram: 'https://www.instagram.com/beyonce',
      twitter: 'https://twitter.com/Beyonce',
      facebook: 'https://www.facebook.com/beyonce',
      youtube: 'https://www.youtube.com/@beyonce'
    }
  },
  {
    name: 'Ed Sheeran', slug: 'ed-sheeran', category: 'music', nationality: 'British', featured: false,
    birthDate: new Date('1991-02-17'),
    shortBio: 'Shape of You singer-songwriter with over 150 million albums sold worldwide.',
    bio: 'Edward Christopher Sheeran is an English singer-songwriter who has sold more than 150 million records worldwide. Known for his intimate acoustic performances and emotionally resonant lyrics, Sheeran has topped charts in over 30 countries. His albums include Plus, Multiply, Divide and Equals. He frequently collaborates with other artists across genres and is famous for performing his world tours almost entirely solo on stage with just a guitar and loop pedal.',
    socialLinks: {
      instagram: 'https://www.instagram.com/teddysphotos',
      twitter: 'https://twitter.com/edsheeran',
      facebook: 'https://www.facebook.com/EdSheeranMusic',
      youtube: 'https://www.youtube.com/@EdSheeran'
    }
  },
  {
    name: 'Rihanna', slug: 'rihanna', category: 'music', nationality: 'Barbadian', featured: true,
    birthDate: new Date('1988-02-20'),
    shortBio: 'Pop & R&B icon, Fenty Beauty founder, and Super Bowl headliner.',
    bio: 'Robyn Rihanna Fenty is a Barbadian singer, actress, and businesswoman who emerged as one of the world\'s best-selling music artists with hits spanning pop, dancehall, and R&B. With over 250 million records sold, she is one of the best-selling music artists of all time. Beyond music, she disrupted the beauty industry with her inclusive Fenty Beauty line and launched Savage X Fenty lingerie. Her 2023 Super Bowl halftime performance drew over 118 million viewers.',
    socialLinks: {
      instagram: 'https://www.instagram.com/badgalriri',
      twitter: 'https://twitter.com/rihanna',
      facebook: 'https://www.facebook.com/rihanna',
      youtube: 'https://www.youtube.com/@Rihanna'
    }
  },
  {
    name: 'Bad Bunny', slug: 'bad-bunny', category: 'music', nationality: 'Puerto Rican', featured: false,
    birthDate: new Date('1994-03-10'),
    shortBio: 'Latin trap & reggaeton superstar — most-streamed artist on Spotify multiple years running.',
    bio: 'Benito Antonio Martínez Ocasio, known as Bad Bunny, is a Puerto Rican rapper and singer who became the first non-English-language artist to top the Spotify year-end chart. His innovative blend of Latin trap, reggaeton, and experimental sounds has redefined global music trends. He has headlined Coachella, starred in films and TV, and his albums Un Verano Sin Ti and Nadie Sabe Lo Que Va a Pasar Mañana broke streaming records worldwide.',
    socialLinks: {
      instagram: 'https://www.instagram.com/badbunnypr',
      twitter: 'https://twitter.com/sanbenito',
      youtube: 'https://www.youtube.com/@BadBunnyPR'
    }
  },

  // ── Film ──
  {
    name: 'Dwayne Johnson', slug: 'dwayne-johnson', category: 'film', nationality: 'American', featured: true,
    birthDate: new Date('1972-05-02'),
    shortBio: 'The Rock — WWE legend turned Hollywood\'s highest-paid actor.',
    bio: 'Dwayne Douglas Johnson, widely known by his ring name The Rock, is an American actor, businessman, and former professional wrestler. After a celebrated career in the WWE, he transitioned into Hollywood where he became one of the highest-paid and most bankable actors in the world. His films—including the Fast & Furious franchise, Jumanji, and Black Adam—have collectively grossed billions at the global box office. He is also the co-founder of Teremana Tequila and ZOA Energy.',
    socialLinks: {
      instagram: 'https://www.instagram.com/therock',
      twitter: 'https://twitter.com/TheRock',
      facebook: 'https://www.facebook.com/DwayneJohnson',
      youtube: 'https://www.youtube.com/@TheRock'
    }
  },
  {
    name: 'Scarlett Johansson', slug: 'scarlett-johansson', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1984-11-22'),
    shortBio: 'Marvel\'s Black Widow and one of the highest-grossing actresses in cinema history.',
    bio: 'Scarlett Ingrid Johansson is an American actress and singer who began her career as a child actor before becoming one of the most recognisable faces in Hollywood. Best known for her role as Natasha Romanoff / Black Widow in the Marvel Cinematic Universe, she has also earned critical acclaim for her work in Marriage Story, Her, and Lost in Translation. She has been the world\'s highest-paid actress multiple times and is a producer through her production company These Pictures.',
    socialLinks: {
      facebook: 'https://www.facebook.com/scarlettjohansson'
    }
  },
  {
    name: 'Leonardo DiCaprio', slug: 'leonardo-dicaprio', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1974-11-11'),
    shortBio: 'Oscar-winning actor and passionate environmentalist behind The Revenant and Titanic.',
    bio: 'Leonardo Wilhelm DiCaprio is an American actor and film producer known for his roles in biographical and period films. After a breakthrough role in Titanic (1997), he built one of the most celebrated careers in Hollywood, earning Academy Award nominations for The Aviator, Blood Diamond, The Wolf of Wall Street, and winning his first Oscar for The Revenant. He is also a prominent environmental activist and operates the Leonardo DiCaprio Foundation for conservation.',
    socialLinks: {
      instagram: 'https://www.instagram.com/leonardodicaprio',
      twitter: 'https://twitter.com/LeoDiCaprio',
      facebook: 'https://www.facebook.com/LeonardoDiCaprio'
    }
  },

  // ── Sports ──
  {
    name: 'Cristiano Ronaldo', slug: 'cristiano-ronaldo', category: 'sports', nationality: 'Portuguese', featured: true,
    birthDate: new Date('1985-02-05'),
    shortBio: 'CR7 — five-time Ballon d\'Or winner and all-time international top scorer.',
    bio: 'Cristiano Ronaldo dos Santos Aveiro, known as CR7, is a Portuguese professional footballer widely regarded as one of the greatest players of all time. He has won five UEFA Champions League titles, five Ballon d\'Or awards, and is the all-time top scorer in men\'s international football. He has played for Sporting CP, Manchester United, Real Madrid, Juventus, and Al Nassr. Off the pitch, his CR7 brand spans fashion, hotels, fragrance, and a dedicated worldwide fan base of hundreds of millions.',
    socialLinks: {
      instagram: 'https://www.instagram.com/cristiano',
      twitter: 'https://twitter.com/Cristiano',
      facebook: 'https://www.facebook.com/Cristiano',
      youtube: 'https://www.youtube.com/@CristianoRonaldo'
    }
  },
  {
    name: 'LeBron James', slug: 'lebron-james', category: 'sports', nationality: 'American', featured: true,
    birthDate: new Date('1984-12-30'),
    shortBio: 'King James — 4x NBA champion, all-time NBA scoring leader, and businessman.',
    bio: 'LeBron Raymone James Sr., nicknamed King James, is an American professional basketball player for the Los Angeles Lakers. Widely considered one of the greatest basketball players of all time, he is the all-time leading scorer in NBA history. He has won four NBA championships with three different teams, earned four NBA Finals MVP awards, and represented the United States in the Olympics. Beyond basketball, he co-founded SpringHill Entertainment and is the first active NBA player to achieve billionaire status.',
    socialLinks: {
      instagram: 'https://www.instagram.com/kingjames',
      twitter: 'https://twitter.com/KingJames',
      facebook: 'https://www.facebook.com/LeBronJames'
    }
  },
  {
    name: 'Serena Williams', slug: 'serena-williams', category: 'sports', nationality: 'American', featured: false,
    birthDate: new Date('1981-09-26'),
    shortBio: '23-time Grand Slam champion and one of the greatest athletes in history.',
    bio: 'Serena Jameka Williams is a former American professional tennis player who is widely regarded as one of the greatest athletes of all time. She won 23 Grand Slam singles titles—the most by any player in the Open Era—and held the world No. 1 ranking for a record 319 weeks. After retiring from professional tennis in 2022, she became a venture capital investor through Serena Ventures and continues to inspire millions as a mother, entrepreneur, and cultural icon.',
    socialLinks: {
      instagram: 'https://www.instagram.com/serenawilliams',
      twitter: 'https://twitter.com/serenawilliams',
      facebook: 'https://www.facebook.com/SerenaWilliams',
      youtube: 'https://www.youtube.com/@SerenaWilliams'
    }
  },
  {
    name: 'Lionel Messi', slug: 'lionel-messi', category: 'sports', nationality: 'Argentine', featured: true,
    birthDate: new Date('1987-06-24'),
    shortBio: 'La Pulga — 8x Ballon d\'Or winner and 2022 FIFA World Cup champion with Argentina.',
    bio: 'Lionel Andrés Messi, known as La Pulga (The Flea), is an Argentine professional footballer universally considered one of the greatest players in football history. He spent 21 years at FC Barcelona before joining Paris Saint-Germain and then Inter Miami CF. He has won 8 Ballon d\'Or awards—more than any player in history—and led Argentina to their historic 2022 FIFA World Cup triumph. His 91 goals in a calendar year and over 800 career club goals are world records.',
    socialLinks: {
      instagram: 'https://www.instagram.com/leomessi',
      facebook: 'https://www.facebook.com/LeoMessi',
      youtube: 'https://www.youtube.com/@leomessi'
    }
  },

  // ── TV ──
  {
    name: 'Oprah Winfrey', slug: 'oprah-winfrey', category: 'tv', nationality: 'American', featured: false,
    birthDate: new Date('1954-01-29'),
    shortBio: 'Legendary TV host, media mogul, philanthropist, and cultural icon.',
    bio: 'Oprah Gail Winfrey is an American talk show host, television producer, actress, author, and media proprietor. Her talk show, The Oprah Winfrey Show, was the highest-rated television program of its kind in history and ran for 25 years. She has been ranked the richest African-American and the greatest Black philanthropist in American history. Through her OWN network, book club, and numerous charitable initiatives, she continues to influence culture and inspire millions worldwide.',
    socialLinks: {
      instagram: 'https://www.instagram.com/oprah',
      twitter: 'https://twitter.com/Oprah',
      facebook: 'https://www.facebook.com/oprah',
      youtube: 'https://www.youtube.com/@OWN'
    }
  },
  {
    name: 'Kim Kardashian', slug: 'kim-kardashian', category: 'tv', nationality: 'American', featured: false,
    birthDate: new Date('1980-10-21'),
    shortBio: 'Reality TV star, SKIMS founder, and billionaire entrepreneur.',
    bio: 'Kimberly Noel Kardashian is an American media personality, socialite, and businesswoman who rose to fame through the reality TV series Keeping Up with the Kardashians. She has built a business empire including SKIMS shapewear—now valued at over $4 billion—and SKKN BY KIM skincare. She is also a criminal justice reform advocate and is studying to become a lawyer. Forbes recognised her as a billionaire in 2021, and she remains one of the most-followed people on social media worldwide.',
    socialLinks: {
      instagram: 'https://www.instagram.com/kimkardashian',
      twitter: 'https://twitter.com/KimKardashian',
      facebook: 'https://www.facebook.com/KimKardashian',
      youtube: 'https://www.youtube.com/@KimKardashian'
    }
  },

  // ── Music (continued) ──
  {
    name: 'Adele', slug: 'adele', category: 'music', nationality: 'British', featured: true,
    birthDate: new Date('1988-05-05'),
    shortBio: 'British soul powerhouse with 16 Grammys and over 120 million records sold worldwide.',
    bio: 'Adele Laurie Blue Adkins, known simply as Adele, is a British singer-songwriter who has captivated the world with her powerful contralto voice and emotionally raw ballads. Her albums 19, 21, 25 and 30 have broken sales records worldwide, and her single Hello became a global phenomenon. She has won 16 Grammy Awards, a Golden Globe and an Academy Award. Known for her candid personality and heartfelt lyrics, she is one of the best-selling music artists in history with over 120 million records sold.',
    socialLinks: {
      instagram: 'https://www.instagram.com/adele',
      twitter: 'https://twitter.com/Adele',
      facebook: 'https://www.facebook.com/adele',
      youtube: 'https://www.youtube.com/@Adele'
    }
  },
  {
    name: 'Justin Bieber', slug: 'justin-bieber', category: 'music', nationality: 'Canadian', featured: true,
    birthDate: new Date('1994-03-01'),
    shortBio: 'Canadian pop phenomenon — from YouTube teen idol to global R&B superstar with 150M records sold.',
    bio: 'Justin Drew Bieber is a Canadian pop singer who was discovered through YouTube at age 13 by talent manager Scooter Braun. He became one of the youngest solo male artists to reach No. 1 on the Billboard Hot 100 and has sold over 150 million records worldwide. Known for hits like Baby, Sorry, Love Yourself and Peaches, he has evolved from teen idol to serious R&B artist. He is also a style icon and has collaborated with brands including H&M and Drew House, his own clothing line.',
    socialLinks: {
      instagram: 'https://www.instagram.com/justinbieber',
      twitter: 'https://twitter.com/justinbieber',
      facebook: 'https://www.facebook.com/JustinBieber',
      youtube: 'https://www.youtube.com/@JustinBieber'
    }
  },
  {
    name: 'Billie Eilish', slug: 'billie-eilish', category: 'music', nationality: 'American', featured: false,
    birthDate: new Date('2001-12-18'),
    shortBio: 'Record-breaking youngest Grammy sweep winner at 18 — defining the sound of a new pop generation.',
    bio: 'Billie Eilish Pirate Baird O\'Connell is an American singer-songwriter who became the youngest person to win all four main Grammy Awards in one night in 2020, at age 18. Known for her signature whispery vocals, dark aesthetics and genre-blending music, she rose to fame with the viral hit Ocean Eyes. Her debut album When We All Fall Asleep, Where Do We Go? and follow-up Happier Than Ever have earned universal acclaim. She is also a prominent advocate for mental health, body positivity and climate action.',
    socialLinks: {
      instagram: 'https://www.instagram.com/billieeilish',
      twitter: 'https://twitter.com/billieeilish',
      facebook: 'https://www.facebook.com/billieeilish',
      youtube: 'https://www.youtube.com/@BillieEilish'
    }
  },
  {
    name: 'Ariana Grande', slug: 'ariana-grande', category: 'music', nationality: 'American', featured: true,
    birthDate: new Date('1993-06-26'),
    shortBio: 'Four-octave pop icon and actress who became the most-followed woman on Instagram.',
    bio: 'Ariana Grande-Butera is an American pop star, actress and songwriter whose four-octave vocal range has drawn comparisons to Mariah Carey. Rising from Nickelodeon actress to global pop icon, she has released chart-topping albums including Thank U, Next and Positions. She holds multiple Guinness World Records, including the first artist to debut at No. 1 with her first three studio albums. A survivor and powerful advocate following the 2017 Manchester Arena bombing, she organised the One Love Manchester benefit concert.',
    socialLinks: {
      instagram: 'https://www.instagram.com/arianagrande',
      twitter: 'https://twitter.com/ArianaGrande',
      facebook: 'https://www.facebook.com/arianagrande',
      youtube: 'https://www.youtube.com/@ArianaGrande'
    }
  },
  {
    name: 'The Weeknd', slug: 'the-weeknd', category: 'music', nationality: 'Canadian', featured: false,
    birthDate: new Date('1990-02-16'),
    shortBio: 'Canadian R&B icon behind Blinding Lights — the most-charted Billboard Hot 100 song in history.',
    bio: 'Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter and record producer from Scarborough, Ontario. He rose to fame through anonymous SoundCloud releases before going mainstream with his mixtape trilogy Trilogy. His dark R&B and synth-pop style has produced global hits including Blinding Lights—the most charted song in Billboard Hot 100 history—as well as Can\'t Feel My Face and Starboy. He is one of the best-selling artists of all time with over 75 million records sold.',
    socialLinks: {
      instagram: 'https://www.instagram.com/theweeknd',
      twitter: 'https://twitter.com/theweeknd',
      facebook: 'https://www.facebook.com/theweeknd',
      youtube: 'https://www.youtube.com/@TheWeeknd'
    }
  },
  {
    name: 'Post Malone', slug: 'post-malone', category: 'music', nationality: 'American', featured: false,
    birthDate: new Date('1995-07-04'),
    shortBio: 'Tattooed genre-bending superstar who has sold over 80 million albums with a unique rap-rock sound.',
    bio: 'Austin Richard Post, known professionally as Post Malone, is an American rapper, singer, songwriter and guitarist known for his blending of hip-hop, rock, pop and country. He rose to fame with his debut single White Iverson in 2015 and has since released multi-platinum albums including Stoney, Beerbongs & Bentleys and Hollywood\'s Bleeding. Known for his distinctive face tattoos and versatile musical style, he has sold over 80 million albums worldwide and collaborated with artists from Kanye West to Ozzy Osbourne.',
    socialLinks: {
      instagram: 'https://www.instagram.com/postmalone',
      twitter: 'https://twitter.com/PostMalone',
      facebook: 'https://www.facebook.com/postmalone',
      youtube: 'https://www.youtube.com/@PostMalone'
    }
  },
  {
    name: 'Doja Cat', slug: 'doja-cat', category: 'music', nationality: 'American', featured: false,
    birthDate: new Date('1995-10-21'),
    shortBio: 'Genre-blending rap-pop star whose Planet Her era made her one of the defining voices of the 2020s.',
    bio: 'Amala Ratna Zandile Dlamini, known professionally as Doja Cat, is an American rapper, singer and songwriter who broke through with the viral hit Mooo! and subsequently dominated charts with Say So, Kiss Me More and Woman. Her eclectic style blends hip-hop, R&B, pop and dance music. Her album Planet Her debuted at number two on the Billboard 200 and earned multiple Grammy nominations. Known for her wit, visual creativity and online presence, she has become one of the defining musical voices of the 2020s.',
    socialLinks: {
      instagram: 'https://www.instagram.com/dojacat',
      twitter: 'https://twitter.com/DojaCat',
      facebook: 'https://www.facebook.com/DojaCatOfficial',
      youtube: 'https://www.youtube.com/@DojaCat'
    }
  },
  {
    name: 'Olivia Rodrigo', slug: 'olivia-rodrigo', category: 'music', nationality: 'American', featured: false,
    birthDate: new Date('2003-02-20'),
    shortBio: 'Gen Z pop-punk sensation whose debut drivers license broke every Spotify streaming record in 2021.',
    bio: 'Olivia Isabel Rodrigo is an American singer-songwriter and actress who became a global pop sensation at age 18 with her debut single drivers license, which broke Spotify streaming records. Her debut album SOUR and follow-up GUTS have established her as the defining voice of Gen Z pop, blending pop-punk, indie and alternative influences with confessional songwriting. She has won three Grammy Awards and is known for her raw, emotionally honest approach to music and her advocacy for young people\'s voices.',
    socialLinks: {
      instagram: 'https://www.instagram.com/oliviarodrigo',
      twitter: 'https://twitter.com/oliviarodrigo',
      facebook: 'https://www.facebook.com/OliviaRodrigo',
      youtube: 'https://www.youtube.com/@OliviaRodrigo'
    }
  },
  {
    name: 'Shakira', slug: 'shakira', category: 'music', nationality: 'Colombian', featured: false,
    birthDate: new Date('1977-02-02'),
    shortBio: 'Colombia\'s iconic superstar — best-selling Latin artist of all time with 80 million records sold.',
    bio: 'Shakira Isabel Mebarak Ripoll is a Colombian singer, songwriter, dancer and record producer who is the best-selling Latin artist of all time. Known for her distinctive vocals, belly dancing and energetic performances, she has sold over 80 million albums worldwide. Her hits include Hips Don\'t Lie, Whenever Wherever and Waka Waka—the best-selling World Cup song ever. She has won three Grammy Awards and twelve Latin Grammy Awards and performed at two Super Bowl halftime shows.',
    socialLinks: {
      instagram: 'https://www.instagram.com/shakira',
      twitter: 'https://twitter.com/shakira',
      facebook: 'https://www.facebook.com/shakira',
      youtube: 'https://www.youtube.com/@Shakira'
    }
  },

  // ── Film (continued) ──
  {
    name: 'Tom Hanks', slug: 'tom-hanks', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1956-07-09'),
    shortBio: 'Two-time Oscar winner beloved for Forrest Gump, Saving Private Ryan and decades of iconic roles.',
    bio: 'Thomas Jeffrey Hanks is an American actor and filmmaker widely regarded as one of the greatest and most beloved actors of his generation. He is one of only two actors to win back-to-back Academy Awards for Best Actor (Philadelphia and Forrest Gump). His filmography spans decades and genres: Big, Cast Away, Saving Private Ryan, The Green Mile, the Toy Story franchise, and Captain Phillips. A humanitarian and history enthusiast, he is also a published author and dedicated advocate for public service and democracy.',
    socialLinks: {
      instagram: 'https://www.instagram.com/tomhanks',
      twitter: 'https://twitter.com/tomhanks',
      facebook: 'https://www.facebook.com/TomHanks'
    }
  },
  {
    name: 'Meryl Streep', slug: 'meryl-streep', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1949-06-22'),
    shortBio: 'Hollywood\'s most nominated actress — 21 Oscar nods, three wins and a career spanning five decades.',
    bio: 'Mary Louise Streep, known as Meryl Streep, is an American actress widely acknowledged as one of the greatest performers in the history of cinema. She has received a record 21 Academy Award nominations and three wins for Kramer vs. Kramer, Sophie\'s Choice and The Iron Lady. Her extraordinary versatility has seen her master accents, languages and characters across countless landmark films including The Devil Wears Prada, Adaptation and The Hours. She is also an outspoken advocate for women\'s rights in Hollywood and beyond.',
    socialLinks: {
      facebook: 'https://www.facebook.com/MerylStreepOfficial'
    }
  },
  {
    name: 'Ryan Reynolds', slug: 'ryan-reynolds', category: 'film', nationality: 'Canadian', featured: false,
    birthDate: new Date('1976-10-23'),
    shortBio: 'Deadpool star turned serial entrepreneur — co-owner of Wrexham AFC and Aviation American Gin.',
    bio: 'Ryan Rodney Reynolds is a Canadian-American actor, producer and entrepreneur known for his sharp wit, charisma and the Deadpool franchise. After years of supporting roles, he became a global star with Deadpool (2016), which he also produced and co-wrote. He is also the owner of Aviation American Gin and Wrexham AFC football club, documented in the Disney+ series Welcome to Wrexham. His social media presence and marketing genius have made him a cultural phenomenon beyond film.',
    socialLinks: {
      instagram: 'https://www.instagram.com/vancityreynolds',
      twitter: 'https://twitter.com/VancityReynolds',
      facebook: 'https://www.facebook.com/RyanReynolds',
      youtube: 'https://www.youtube.com/@RyanReynolds'
    }
  },
  {
    name: 'Zendaya', slug: 'zendaya', category: 'film', nationality: 'American', featured: true,
    birthDate: new Date('1996-09-01'),
    shortBio: 'Emmy-winning star of Euphoria and Dune — Hollywood\'s most exciting young talent and style icon.',
    bio: 'Zendaya Maree Stoermer Coleman is an American actress, singer and producer who began her career on Disney Channel before becoming one of the most celebrated performers of her generation. She made history as the youngest winner of the Emmy Award for Outstanding Lead Actress in a Drama Series for Euphoria at age 24. Her film credits include the Spider-Man franchise and the Oscar-nominated Dune films. A fashion icon and vocal advocate for inclusivity, she was named TIME\'s Entertainer of the Year.',
    socialLinks: {
      instagram: 'https://www.instagram.com/zendaya',
      twitter: 'https://twitter.com/Zendaya',
      facebook: 'https://www.facebook.com/Zendaya',
      youtube: 'https://www.youtube.com/@Zendaya'
    }
  },
  {
    name: 'Will Smith', slug: 'will-smith', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1968-09-25'),
    shortBio: 'Fresh Prince turned Oscar-winning Hollywood star with a $9 billion global box office record.',
    bio: 'Willard Carroll Smith Jr. is an American actor, rapper and producer who began his career as The Fresh Prince before becoming one of the most bankable stars in Hollywood history. His films—including Ali, The Pursuit of Happyness, Hitch and the Men in Black franchise—have grossed over $9 billion at the global box office. He won the Academy Award for Best Actor for his portrayal of Richard Williams in King Richard (2022). He is also a Grammy-winning rap artist, bestselling author and YouTube content creator.',
    socialLinks: {
      instagram: 'https://www.instagram.com/willsmith',
      twitter: 'https://twitter.com/willsmith',
      facebook: 'https://www.facebook.com/WillSmith',
      youtube: 'https://www.youtube.com/@WillSmith'
    }
  },
  {
    name: 'Margot Robbie', slug: 'margot-robbie', category: 'film', nationality: 'Australian', featured: false,
    birthDate: new Date('1990-07-02'),
    shortBio: 'Australian actress and producer behind Barbie, I, Tonya and The Wolf of Wall Street.',
    bio: 'Margot Elise Robbie is an Australian actress and producer who has established herself as one of the most versatile and sought-after performers in Hollywood. She gained international attention for her role in The Wolf of Wall Street and has since delivered acclaimed performances in Suicide Squad, I, Tonya (Academy Award nomination), Bombshell and Barbie. As founder of LuckyChap Entertainment, she has produced several critically successful films and is committed to telling female-led stories on screen.',
    socialLinks: {
      instagram: 'https://www.instagram.com/margotrobbie',
      facebook: 'https://www.facebook.com/MargotRobbie'
    }
  },
  {
    name: 'Johnny Depp', slug: 'johnny-depp', category: 'film', nationality: 'American', featured: false,
    birthDate: new Date('1963-06-09'),
    shortBio: 'Captain Jack Sparrow himself — one of Hollywood\'s most charismatic and transformative character actors.',
    bio: 'John Christopher Depp II is an American actor and musician renowned for his transformative character work and eccentric screen personas. He is best known for his iconic portrayal of Captain Jack Sparrow in the Pirates of the Caribbean franchise, a role that earned him his first Academy Award nomination. His other acclaimed work includes Edward Scissorhands, Fear and Loathing in Las Vegas, Ed Wood and Donnie Brasco. Outside acting, he plays guitar and performs with Hollywood Vampires alongside Alice Cooper and Joe Perry.',
    socialLinks: {
      instagram: 'https://www.instagram.com/johnnydepp',
      facebook: 'https://www.facebook.com/JohnnyDepp',
      youtube: 'https://www.youtube.com/@JohnnyDepp'
    }
  },

  // ── Sports (continued) ──
  {
    name: 'Naomi Osaka', slug: 'naomi-osaka', category: 'sports', nationality: 'Japanese', featured: false,
    birthDate: new Date('1997-10-16'),
    shortBio: 'Four-time Grand Slam champion and pioneering mental health advocate in professional sport.',
    bio: 'Naomi Osaka is a Japanese professional tennis player who has won four Grand Slam singles titles—two US Open and two Australian Open championships. She became the first Asian player to hold the No. 1 WTA ranking in singles. A trailblazer for mental health advocacy in professional sport, she famously withdrew from Roland Garros in 2021 to prioritise her wellbeing. Born to a Japanese mother and Haitian father, she has represented Japan in the Olympics and is one of the most commercially successful athletes in the world.',
    socialLinks: {
      instagram: 'https://www.instagram.com/naomiosaka',
      twitter: 'https://twitter.com/naomiosaka',
      youtube: 'https://www.youtube.com/@NaomiOsaka'
    }
  },
  {
    name: 'Simone Biles', slug: 'simone-biles', category: 'sports', nationality: 'American', featured: false,
    birthDate: new Date('1997-03-14'),
    shortBio: 'The greatest gymnast of all time — 37 World medals and four skills named in her honour by the FIG.',
    bio: 'Simone Arianne Biles is an American artistic gymnast widely considered the greatest gymnast of all time. She has won 37 World Championship medals—the most of any gymnast in history—and seven Olympic medals including four gold. Known for performing skills so difficult that four manoeuvres have been named after her by the FIG, she revolutionised the sport. Her courageous decision to withdraw from the 2020 Tokyo Olympics to protect her mental health sparked a global conversation and made her an icon for athlete wellbeing and advocacy.',
    socialLinks: {
      instagram: 'https://www.instagram.com/simonebiles',
      twitter: 'https://twitter.com/Simone_Biles',
      facebook: 'https://www.facebook.com/SimoneBiles',
      youtube: 'https://www.youtube.com/@SimoneBiles'
    }
  },
  {
    name: 'Usain Bolt', slug: 'usain-bolt', category: 'sports', nationality: 'Jamaican', featured: false,
    birthDate: new Date('1986-08-21'),
    shortBio: 'Lightning Bolt — 8x Olympic gold medalist and world record holder in both the 100m and 200m.',
    bio: 'Usain St. Leo Bolt is a retired Jamaican sprinter widely considered the greatest sprinter of all time and a global sporting legend. He is the world record holder in both the 100 metres (9.58 seconds) and 200 metres (19.19 seconds) and is the only man to win the 100m and 200m at three consecutive Olympic Games. Known as Lightning Bolt, he won eight Olympic gold medals and eleven World Championship gold medals across his career. His magnetic personality and showmanship made him one of the most beloved athletes in Olympic history.',
    socialLinks: {
      instagram: 'https://www.instagram.com/usainbolt',
      twitter: 'https://twitter.com/usainbolt',
      facebook: 'https://www.facebook.com/UsainBolt',
      youtube: 'https://www.youtube.com/@UsainBolt'
    }
  },
  {
    name: 'Neymar Jr', slug: 'neymar-jr', category: 'sports', nationality: 'Brazilian', featured: false,
    birthDate: new Date('1992-02-05'),
    shortBio: 'Brazil\'s all-time top scorer and the world\'s most expensive football transfer at €222 million.',
    bio: 'Neymar da Silva Santos Júnior, known as Neymar Jr, is a Brazilian professional footballer and one of the most exciting and flamboyant players of his generation. He became one of the world\'s most expensive players when he transferred from FC Barcelona to Paris Saint-Germain for €222 million in 2017—a world record fee. He is Brazil\'s all-time top scorer in international football. Known for his dribbling, creativity and flair, he is also a three-time Olympic medalist and founded the Instituto Projeto Neymar Jr charity for underprivileged youth.',
    socialLinks: {
      instagram: 'https://www.instagram.com/neymarjr',
      twitter: 'https://twitter.com/neymarjr',
      facebook: 'https://www.facebook.com/neymar',
      youtube: 'https://www.youtube.com/@NeymarJr'
    }
  },
  {
    name: 'Stephen Curry', slug: 'stephen-curry', category: 'sports', nationality: 'American', featured: false,
    birthDate: new Date('1988-03-14'),
    shortBio: 'The greatest shooter in NBA history — four-time champion who revolutionised basketball.',
    bio: 'Wardell Stephen Curry II, known as Steph Curry, is an American professional basketball player for the Golden State Warriors and widely regarded as the greatest shooter in NBA history. He has won four NBA championships and two NBA MVP awards, and his revolutionary three-point shooting has fundamentally changed how the game is played. He holds the NBA record for most three-pointers made in a season and in a career. Beyond basketball, he is involved in multiple business ventures and the Eat. Learn. Play. Foundation.',
    socialLinks: {
      instagram: 'https://www.instagram.com/stephencurry30',
      twitter: 'https://twitter.com/StephenCurry30',
      facebook: 'https://www.facebook.com/StephenCurry',
      youtube: 'https://www.youtube.com/@StephenCurry'
    }
  },
  {
    name: 'Kylian Mbappé', slug: 'kylian-mbappe', category: 'sports', nationality: 'French', featured: false,
    birthDate: new Date('1998-12-20'),
    shortBio: 'French football prodigy — 2018 World Cup winner and top scorer for PSG and the French national team.',
    bio: 'Kylian Mbappé Lottin is a French professional footballer for Real Madrid and the French national team who is widely regarded as the best player of his generation. At just 19, he became only the second teenager after Pelé to score in a FIFA World Cup final, helping France win the 2018 World Cup. He is the top scorer in the history of Paris Saint-Germain and France\'s national team. His blistering pace, technical skill and goal-scoring ability have drawn comparisons to both Cristiano Ronaldo and Lionel Messi.',
    socialLinks: {
      instagram: 'https://www.instagram.com/k.mbappe',
      twitter: 'https://twitter.com/KMbappe',
      facebook: 'https://www.facebook.com/KylianMbappe',
      youtube: 'https://www.youtube.com/@KylianMbappe'
    }
  },
  {
    name: 'Roger Federer', slug: 'roger-federer', category: 'sports', nationality: 'Swiss', featured: false,
    birthDate: new Date('1981-08-08'),
    shortBio: 'Swiss tennis legend with 20 Grand Slams and 310 weeks as world No. 1 — the game\'s greatest icon.',
    bio: 'Roger Federer is a retired Swiss professional tennis player who is universally regarded as one of the greatest tennis players of all time. He won 20 Grand Slam singles titles and held the world No. 1 ranking for a record 310 weeks, including 237 consecutive weeks. Known for his elegant playing style, remarkable versatility on all surfaces and exceptional sportsmanship, he competed at the highest level for over two decades. After retiring in 2022, he remains a global ambassador for the sport and a UNICEF Goodwill Ambassador.',
    socialLinks: {
      instagram: 'https://www.instagram.com/rogerfederer',
      twitter: 'https://twitter.com/rogerfederer',
      facebook: 'https://www.facebook.com/roger.federer',
      youtube: 'https://www.youtube.com/@RogerFederer'
    }
  },

  // ── TV (continued) ──
  {
    name: 'Jennifer Aniston', slug: 'jennifer-aniston', category: 'tv', nationality: 'American', featured: false,
    birthDate: new Date('1969-02-11'),
    shortBio: 'Rachel Green of Friends — Emmy-winning actress and one of Hollywood\'s most enduring icons.',
    bio: 'Jennifer Joanna Aniston is an American actress and producer who became a household name through her iconic portrayal of Rachel Green in the NBC sitcom Friends (1994–2004). The role earned her the Emmy, Golden Globe and Screen Actors Guild Awards. She has since built a successful film career with The Good Girl, Marley & Me and Horrible Bosses, and her dramatic turn in The Morning Show on Apple TV+ earned critical acclaim. She is also a beauty entrepreneur and co-founder of LolaVie haircare.',
    socialLinks: {
      instagram: 'https://www.instagram.com/jenniferaniston',
      facebook: 'https://www.facebook.com/JenniferAniston',
      youtube: 'https://www.youtube.com/@JenniferAniston'
    }
  },
  {
    name: 'Gordon Ramsay', slug: 'gordon-ramsay', category: 'tv', nationality: 'British', featured: false,
    birthDate: new Date('1966-11-08'),
    shortBio: '17 Michelin star chef and TV personality behind Hell\'s Kitchen, MasterChef and Kitchen Nightmares.',
    bio: 'Gordon James Ramsay is a British celebrity chef, restaurateur, television personality and writer who has been awarded 17 Michelin stars throughout his career and currently holds seven. Known for his fiery personality and exacting culinary standards, he became a global household name through television series including Hell\'s Kitchen, MasterChef, Kitchen Nightmares and Next Level Chef. He runs multiple restaurants worldwide and is one of the highest-earning chefs in the world. He is also a passionate marathon runner and Ironman triathlete.',
    socialLinks: {
      instagram: 'https://www.instagram.com/gordongram',
      twitter: 'https://twitter.com/GordonRamsay',
      facebook: 'https://www.facebook.com/GordonRamsay',
      youtube: 'https://www.youtube.com/@GordonRamsay'
    }
  },
  {
    name: 'Ellen DeGeneres', slug: 'ellen-degeneres', category: 'tv', nationality: 'American', featured: false,
    birthDate: new Date('1958-01-26'),
    shortBio: 'Legendary TV host who ran The Ellen Show for 19 seasons and made history as an LGBTQ+ advocate.',
    bio: 'Ellen Lee DeGeneres is an American comedian, television host, actress, writer and producer best known for hosting The Ellen DeGeneres Show for 19 seasons from 2003 to 2022. She came out as gay in 1997 on her sitcom Ellen—a landmark moment in television history—and has since been a prominent LGBTQ+ advocate. She has won numerous Emmy, People\'s Choice and Daytime Emmy Awards and was awarded the Presidential Medal of Freedom in 2016. Her voice role as Dory in Finding Nemo and Finding Dory has made her beloved by multiple generations.',
    socialLinks: {
      instagram: 'https://www.instagram.com/theellenshow',
      twitter: 'https://twitter.com/TheEllenShow',
      facebook: 'https://www.facebook.com/ellentv',
      youtube: 'https://www.youtube.com/@TheEllenShow'
    }
  },
  {
    name: 'Tyra Banks', slug: 'tyra-banks', category: 'tv', nationality: 'American', featured: false,
    birthDate: new Date('1973-12-04'),
    shortBio: 'Supermodel turned media mogul — creator of America\'s Next Top Model and TYRA Beauty founder.',
    bio: 'Tyra Lynne Banks is an American television personality, producer, businesswoman, actress and former model who was the first African American woman to be featured solo on the covers of GQ and the Sports Illustrated Swimsuit Issue. She created, produced and hosted America\'s Next Top Model for 24 cycles and hosted Dancing with the Stars. A Harvard Business School graduate, she founded TYRA Beauty cosmetics and coined the term "smizing" (smiling with your eyes). She has been a trailblazer for diversity and inclusion in the fashion and entertainment industries.',
    socialLinks: {
      instagram: 'https://www.instagram.com/tyrabanks',
      twitter: 'https://twitter.com/tyrabanks',
      facebook: 'https://www.facebook.com/tyrabanks',
      youtube: 'https://www.youtube.com/@TyraBanks'
    }
  },
  {
    name: 'Simon Cowell', slug: 'simon-cowell', category: 'tv', nationality: 'British', featured: false,
    birthDate: new Date('1959-10-07'),
    shortBio: 'Creator of X Factor and Britain\'s Got Talent — the man who launched One Direction and Susan Boyle.',
    bio: 'Simon Phillip Cowell is a British television personality, producer and music executive who is one of the most powerful and influential figures in the global entertainment industry. He created and produced X Factor, Britain\'s Got Talent and America\'s Got Talent, and served as a judge on American Idol. Through his company Syco Entertainment, he has discovered and launched the careers of artists including One Direction, Susan Boyle and Leona Lewis. Known for his blunt criticism and sharp wit, he has become one of television\'s most recognisable personalities worldwide.',
    socialLinks: {
      instagram: 'https://www.instagram.com/simoncowell',
      twitter: 'https://twitter.com/SimonCowell',
      facebook: 'https://www.facebook.com/simoncowell'
    }
  },
  {
    name: 'James Corden', slug: 'james-corden', category: 'tv', nationality: 'British', featured: false,
    birthDate: new Date('1978-08-22'),
    shortBio: 'British comedian and Late Late Show host who turned Carpool Karaoke into a global phenomenon.',
    bio: 'James Kimberley Corden is a British actor, comedian, presenter and producer who hosted The Late Late Show with James Corden on CBS from 2015 to 2023. He became a global sensation through Carpool Karaoke, a recurring segment in which he sings along with celebrities in his car. The format was adapted into its own Apple TV+ series. Corden won a Tony Award for co-producing One Man, Two Guvnors on Broadway and has appeared in films including Into the Woods, Cats and the Cinderella remake.',
    socialLinks: {
      instagram: 'https://www.instagram.com/j_corden',
      twitter: 'https://twitter.com/JKCorden',
      youtube: 'https://www.youtube.com/@TheLateLateShow'
    }
  },

  // ── Other ──
  {
    name: 'MrBeast', slug: 'mrbeast', category: 'other', nationality: 'American', featured: true,
    birthDate: new Date('1998-05-07'),
    shortBio: 'World\'s most-subscribed YouTuber, known for massive challenges and philanthropy.',
    bio: 'Jimmy Donaldson, known online as MrBeast, is an American YouTuber, philanthropist, and entrepreneur. He is the most-subscribed individual creator on YouTube with over 300 million subscribers. Known for his elaborate challenges, large-scale stunts, and viral philanthropy videos, he has given away millions of dollars to fans and charities. He founded MrBeast Burger, Feastables chocolate, and Beast Philanthropy—a dedicated charity channel that feeds and houses thousands of people annually.',
    socialLinks: {
      instagram: 'https://www.instagram.com/mrbeast',
      twitter: 'https://twitter.com/MrBeast',
      facebook: 'https://www.facebook.com/MrBeast6000',
      youtube: 'https://www.youtube.com/@MrBeast'
    }
  },
  {
    name: 'Logan Paul', slug: 'logan-paul', category: 'other', nationality: 'American', featured: false,
    birthDate: new Date('1995-04-01'),
    shortBio: 'Viral YouTuber turned WWE champion and PRIME co-founder — one of the most entrepreneurial creators.',
    bio: 'Logan Alexander Paul is an American YouTuber, boxer and entrepreneur who amassed over 23 million YouTube subscribers through his vlogs and challenge videos before transitioning into professional boxing. He fought Floyd Mayweather in an exhibition bout in 2021 and became WWE Undisputed Tag Team Champion in 2024. He co-founded PRIME Hydration drink, which became one of the fastest-growing beverage brands in the world, reaching a $1.2 billion valuation within two years. He hosts the Impaulsive podcast with millions of listeners.',
    socialLinks: {
      instagram: 'https://www.instagram.com/loganpaul',
      twitter: 'https://twitter.com/LoganPaul',
      youtube: 'https://www.youtube.com/@LoganPaul'
    }
  },
  {
    name: 'Charli D\'Amelio', slug: 'charli-damelio', category: 'other', nationality: 'American', featured: false,
    birthDate: new Date('2004-05-01'),
    shortBio: 'TikTok\'s biggest star with 150M followers — dancer, entrepreneur and reality TV winner.',
    bio: 'Charli Grace D\'Amelio is an American social media personality and dancer who became the most-followed person on TikTok, amassing over 150 million followers. She rose to fame in 2019 for her dancing videos and has since expanded into fashion with her own clothing line D\'Amelio Footwear, acting, and reality television through The D\'Amelio Show on Hulu. She competed in and won Season 31 of Dancing with the Stars. A vocal advocate for anti-bullying and mental health awareness, she is considered one of the most influential Gen Z social media figures in the world.',
    socialLinks: {
      instagram: 'https://www.instagram.com/charlidamelio',
      twitter: 'https://twitter.com/charlidamelio',
      youtube: 'https://www.youtube.com/@charlidamelio'
    }
  },
  {
    name: 'PewDiePie', slug: 'pewdiepie', category: 'other', nationality: 'Swedish', featured: false,
    birthDate: new Date('1989-10-24'),
    shortBio: 'YouTube\'s most legendary solo creator with 111M subscribers — the original gaming commentary king.',
    bio: 'Felix Arvid Ulf Kjellberg, known online as PewDiePie, is a Swedish YouTuber and internet personality who was the most-subscribed individual YouTube creator for many years, reaching over 111 million subscribers. He began with gaming commentary videos before expanding to commentary, comedy sketches and meme reviews. Known for his conversational style and self-deprecating humour, he built a passionate fan base known as the Bro Army. He has collaborated with charities including Save the Children, raising millions of dollars, and married Marzia Bisognin in 2019.',
    socialLinks: {
      instagram: 'https://www.instagram.com/pewdiepie',
      twitter: 'https://twitter.com/pewdiepie',
      youtube: 'https://www.youtube.com/@PewDiePie'
    }
  },
  {
    name: 'Kylie Jenner', slug: 'kylie-jenner', category: 'other', nationality: 'American', featured: false,
    birthDate: new Date('1997-08-10'),
    shortBio: 'Beauty mogul, billionaire and social media queen — founder of Kylie Cosmetics at just 18 years old.',
    bio: 'Kylie Kristen Jenner is an American media personality, socialite and businesswoman who rose to fame on the reality television series Keeping Up with the Kardashians. She founded Kylie Cosmetics in 2015, which became a billion-dollar brand, making her one of the youngest self-made billionaires in history according to Forbes. She later expanded into Kylie Skin and Kylie Baby. With over 400 million Instagram followers, she is one of the most influential social media figures in the world and a dominant force in the beauty and fashion industries.',
    socialLinks: {
      instagram: 'https://www.instagram.com/kyliejenner',
      twitter: 'https://twitter.com/KylieJenner',
      facebook: 'https://www.facebook.com/KylieJenner',
      youtube: 'https://www.youtube.com/@KylieJenner'
    }
  },
  {
    name: 'Addison Rae', slug: 'addison-rae', category: 'other', nationality: 'American', featured: false,
    birthDate: new Date('2000-10-06'),
    shortBio: 'TikTok star turned actress and pop artist — one of the platform\'s first mainstream crossover successes.',
    bio: 'Addison Rae Easterling is an American social media personality, actress and singer who rose to fame on TikTok, becoming one of the most-followed creators on the platform with over 88 million followers. She expanded into acting with the Netflix film He\'s All That (2021) and launched a music career with her debut single Obsessed. She is also a co-founder of Item Beauty, a clean cosmetics brand. Known for her cheerful personality and dance content, she has become a defining figure of Gen Z pop culture and social media entrepreneurship.'  ,
    socialLinks: {
      instagram: 'https://www.instagram.com/addisonraee',
      twitter: 'https://twitter.com/whoisaddison',
      youtube: 'https://www.youtube.com/@AddisonRae'
    }
  }
];

function makeProducts(celeb) {
  const id = celeb._id;
  const img = (text, cat) => ({ images: [placeholderImg(text, cat)] });
  return [
    // ── Digital ──────────────────────────────────────────────────────────────
    {
      name: `${celeb.name} Fan Card`,
      description: `A beautifully designed digital fan card featuring ${celeb.name}. Collect it, share it, and show the world who your favourite star is. Delivered instantly to your email as a high-resolution digital card.`,
      price: 4.99, celebrity: id, category: 'digital', unlimited: true, stock: 0,
      ...img('Fan Card', 'digital')
    },
    {
      name: `${celeb.name} Digital Wallpaper Pack`,
      description: `A collection of 20 stunning high-resolution digital wallpapers featuring ${celeb.name}. Optimised for desktop, mobile, and tablet. Download instantly after purchase and make every screen a tribute.`,
      price: 7.99, celebrity: id, category: 'digital', unlimited: true, stock: 0,
      ...img('Wallpaper Pack', 'digital')
    },
    {
      name: `${celeb.name} Fan Club Membership`,
      description: `Become an official ${celeb.name} Fan Club member for one full year. Includes a digital membership card, exclusive monthly newsletters, early access to merchandise drops, and members-only giveaway entries.`,
      price: 19.99, celebrity: id, category: 'digital', unlimited: true, stock: 0,
      ...img('Fan Club', 'digital')
    },
    {
      name: `${celeb.name} Digital Art Print`,
      description: `A limited-edition high-resolution digital art print featuring ${celeb.name} in a bespoke illustrated portrait style. Print at home on any size paper or have it professionally framed. Available as an instant download.`,
      price: 9.99, celebrity: id, category: 'digital', unlimited: true, stock: 0,
      ...img('Art Print', 'digital')
    },

    // ── Merchandise ───────────────────────────────────────────────────────────
    {
      name: `${celeb.name} Signed Photo Print`,
      description: `A high-quality A4 printed photograph of ${celeb.name} featuring a printed signature. Delivered in a protective sleeve with a certificate of authenticity. A must-have for every serious fan.`,
      price: 19.99, celebrity: id, category: 'merchandise', stock: 150,
      ...img('Signed Photo', 'merchandise')
    },
    {
      name: `${celeb.name} Official Fan T-Shirt`,
      description: `Show your love with this premium 100% cotton fan T-shirt. Features an exclusive ${celeb.name} graphic print. Available in sizes S–3XL. Soft-washed for a relaxed, comfortable fit.`,
      price: 29.99, celebrity: id, category: 'merchandise', stock: 300,
      ...img('Fan T-Shirt', 'merchandise')
    },
    {
      name: `${celeb.name} Signed Poster (A3)`,
      description: `A large A3 glossy poster of ${celeb.name} with a printed signature and gold foil star border. Frame it and make it the centrepiece of any fan's room. Ships worldwide in a rigid tube.`,
      price: 34.99, celebrity: id, category: 'merchandise', stock: 100,
      ...img('Signed Poster', 'merchandise')
    },
    {
      name: `${celeb.name} Fan Hoodie`,
      description: `A cosy, heavyweight fan hoodie featuring an exclusive ${celeb.name} design on the chest and back. Perfect for concerts, casual wear, or gifting. Pre-shrunk fleece, unisex fit, sizes S–3XL.`,
      price: 54.99, celebrity: id, category: 'merchandise', stock: 200,
      ...img('Fan Hoodie', 'merchandise')
    },
    {
      name: `${celeb.name} Ceramic Coffee Mug`,
      description: `Start every morning as a fan with this 11 oz ceramic mug featuring a bold ${celeb.name} design. Dishwasher and microwave safe. The perfect desk companion or gift for a fellow fan.`,
      price: 14.99, celebrity: id, category: 'merchandise', stock: 250,
      ...img('Coffee Mug', 'merchandise')
    },
    {
      name: `${celeb.name} Premium Phone Case`,
      description: `Protect your phone in style with this slim-fit ${celeb.name} fan phone case. Available for iPhone and Samsung Galaxy models. Features a high-quality printed graphic with a matte finish and raised edge protection.`,
      price: 24.99, celebrity: id, category: 'merchandise', stock: 200,
      ...img('Phone Case', 'merchandise')
    },
    {
      name: `${celeb.name} Canvas Tote Bag`,
      description: `A sturdy 100% natural canvas tote bag featuring an exclusive ${celeb.name} print. Reinforced handles and a large interior make it perfect for shopping, the gym, or everyday use. Machine washable.`,
      price: 17.99, celebrity: id, category: 'merchandise', stock: 150,
      ...img('Tote Bag', 'merchandise')
    },
    {
      name: `${celeb.name} Enamel Pin Set`,
      description: `A set of three collectible hard enamel pins celebrating ${celeb.name}. Each pin features a unique design: a portrait, a signature motif, and a signature quote badge. Includes a presentation backing card. Perfect for jackets, bags, or display.`,
      price: 12.99, celebrity: id, category: 'merchandise', stock: 300,
      ...img('Enamel Pins', 'merchandise')
    },
    {
      name: `${celeb.name} Collector's Puzzle (500 pieces)`,
      description: `A 500-piece jigsaw puzzle featuring a stunning ${celeb.name} collage. Finished puzzle measures 50×37 cm. High-quality matte print on thick chipboard. Presented in a sturdy box — ideal for fans of all ages.`,
      price: 27.99, celebrity: id, category: 'merchandise', stock: 80,
      ...img('500pc Puzzle', 'merchandise')
    },
    {
      name: `${celeb.name} Collector's Bundle`,
      description: `The ultimate fan bundle: includes a signed photo print, an official fan T-shirt, a digital wallpaper pack, and a fan card — all in one discounted bundle. Ships in premium branded packaging. Limited stock.`,
      price: 69.99, celebrity: id, category: 'merchandise', stock: 40,
      ...img("Collector's Bundle", 'merchandise')
    },

    // ── Experiences ───────────────────────────────────────────────────────────
    {
      name: `${celeb.name} Birthday Shoutout`,
      description: `Arrange an exclusive personalised birthday shoutout in ${celeb.name}'s style — a heartfelt video message delivered to your inbox in 3–5 business days. The perfect surprise for a superfan.`,
      price: 49.99, celebrity: id, category: 'experience', stock: 50,
      ...img('Birthday Shoutout', 'experience')
    },
    {
      name: `${celeb.name} Personalised Video Message`,
      description: `Request a personal video message from ${celeb.name}'s team for any occasion — birthday, anniversary, graduation, or just to say hello. Delivered as a shareable digital file within 5 business days.`,
      price: 149.99, celebrity: id, category: 'experience', stock: 20,
      ...img('Video Message', 'experience')
    },
    {
      name: `${celeb.name} VIP Meet & Greet Pass`,
      description: `The ultimate fan experience — a VIP Meet & Greet pass that grants backstage or exclusive access to meet ${celeb.name} at a selected event. Includes a photo opportunity, signed memorabilia, and a premium fan gift bag.`,
      price: 349.99, celebrity: id, category: 'experience', stock: 5,
      ...img('VIP Meet & Greet', 'experience')
    },

    // ── Donations ─────────────────────────────────────────────────────────────
    {
      name: `${celeb.name} Digital Gift Card — $25`,
      description: `Send a $25 fan gift card in ${celeb.name}'s name. A perfect way to show your support. The gift card can be redeemed for any item in the ${celeb.name} collection on StarGifts.`,
      price: 25.00, celebrity: id, category: 'donation', unlimited: true, stock: 0,
      ...img('Gift Card $25', 'donation')
    },
    {
      name: `${celeb.name} Digital Gift Card — $50`,
      description: `Send a $50 fan gift card in ${celeb.name}'s name. A great gift for fellow fans or a generous way to show your love and support for ${celeb.name}.`,
      price: 50.00, celebrity: id, category: 'donation', unlimited: true, stock: 0,
      ...img('Gift Card $50', 'donation')
    },
    {
      name: `${celeb.name} Digital Gift Card — $100`,
      description: `Send a premium $100 fan gift card in ${celeb.name}'s name. The ultimate fan gift, perfect for birthdays, holidays, or any special occasion.`,
      price: 100.00, celebrity: id, category: 'donation', unlimited: true, stock: 0,
      ...img('Gift Card $100', 'donation')
    },
    {
      name: `Charity Donation in ${celeb.name}'s Name`,
      description: `Make a charitable donation of $35 in ${celeb.name}'s name to a cause close to their heart. You'll receive a personalised digital certificate to share, showing your contribution in honour of ${celeb.name}.`,
      price: 35.00, celebrity: id, category: 'donation', unlimited: true, stock: 0,
      ...img('Charity Donation', 'donation')
    }
  ];
}

// ── Seed route ───────────────────────────────────────────────────────────────

const https = require('https');

// Wikipedia article titles for each celebrity slug
const WIKI_TITLES = {
  'taylor-swift':      'Taylor_Swift',
  'drake':             'Drake_(musician)',
  'beyonce':           'Beyoncé',
  'ed-sheeran':        'Ed_Sheeran',
  'rihanna':           'Rihanna',
  'bad-bunny':         'Bad_Bunny',
  'adele':             'Adele',
  'justin-bieber':     'Justin_Bieber',
  'billie-eilish':     'Billie_Eilish',
  'ariana-grande':     'Ariana_Grande',
  'the-weeknd':        'The_Weeknd',
  'post-malone':       'Post_Malone',
  'doja-cat':          'Doja_Cat',
  'olivia-rodrigo':    'Olivia_Rodrigo',
  'shakira':           'Shakira',
  'dwayne-johnson':    'Dwayne_Johnson',
  'scarlett-johansson':'Scarlett_Johansson',
  'leonardo-dicaprio': 'Leonardo_DiCaprio',
  'tom-hanks':         'Tom_Hanks',
  'meryl-streep':      'Meryl_Streep',
  'ryan-reynolds':     'Ryan_Reynolds',
  'zendaya':           'Zendaya',
  'will-smith':        'Will_Smith',
  'margot-robbie':     'Margot_Robbie',
  'johnny-depp':       'Johnny_Depp',
  'cristiano-ronaldo': 'Cristiano_Ronaldo',
  'lebron-james':      'LeBron_James',
  'serena-williams':   'Serena_Williams',
  'lionel-messi':      'Lionel_Messi',
  'naomi-osaka':       'Naomi_Osaka',
  'simone-biles':      'Simone_Biles',
  'usain-bolt':        'Usain_Bolt',
  'neymar-jr':         'Neymar',
  'stephen-curry':     'Stephen_Curry',
  'kylian-mbappe':     'Kylian_Mbappé',
  'roger-federer':     'Roger_Federer',
  'oprah-winfrey':     'Oprah_Winfrey',
  'kim-kardashian':    'Kim_Kardashian',
  'jennifer-aniston':  'Jennifer_Aniston',
  'gordon-ramsay':     'Gordon_Ramsay',
  'ellen-degeneres':   'Ellen_DeGeneres',
  'tyra-banks':        'Tyra_Banks',
  'simon-cowell':      'Simon_Cowell',
  'james-corden':      'James_Corden',
  'mrbeast':           'MrBeast',
  'logan-paul':        'Logan_Paul',
  'charli-damelio':    "Charli_D'Amelio",
  'pewdiepie':         'PewDiePie',
  'kylie-jenner':      'Kylie_Jenner',
  'addison-rae':       'Addison_Rae'
};

function fetchWikiPhoto(wikiTitle) {
  return new Promise(resolve => {
    const path = `/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const req = https.get(
      { hostname: 'en.wikipedia.org', path, headers: { 'User-Agent': 'StarGifts/1.0 (https://stargifts.com)' }, timeout: 8000 },
      res => {
        if (res.statusCode !== 200) { res.resume(); return resolve(null); }
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            const j = JSON.parse(raw);
            const src = j.originalimage?.source || j.thumbnail?.source;
            // Resize to 400 px wide thumbnail
            resolve(src ? src.replace(/\/\d+px-/, '/400px-') : null);
          } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

const CATEGORY_COLORS = {
  digital:      { bg: '1a1a2e', fg: 'c9a84c' },
  merchandise:  { bg: '0d0d0d', fg: 'c9a84c' },
  experience:   { bg: '1a1a2e', fg: 'e94560' },
  donation:     { bg: '0d0d0d', fg: '6fcf97' }
};

function placeholderImg(text, cat = 'merchandise') {
  const { bg, fg } = CATEGORY_COLORS[cat] || CATEGORY_COLORS.merchandise;
  return `https://placehold.co/400x400/${bg}/${fg}?text=${encodeURIComponent(text)}`;
}

router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    let celebsCreated = 0, productsCreated = 0, skipped = 0;

    for (const data of CELEBRITIES) {
      let celeb = await Celebrity.findOne({ slug: data.slug });
      if (!celeb) {
        const enc = encodeURIComponent(data.name);
        const wikiTitle = WIKI_TITLES[data.slug];

        // Try Wikipedia first; fall back to initials avatar
        const wikiPhoto = wikiTitle ? await fetchWikiPhoto(wikiTitle) : null;
        data.photo = wikiPhoto ||
          `https://ui-avatars.com/api/?name=${enc}&background=1a1a2e&color=c9a84c&bold=true&size=400`;
        data.coverPhoto = `https://placehold.co/1200x400/0d0d0d/c9a84c?text=${enc}`;

        celeb = await Celebrity.create(data);
        celebsCreated++;

        // Small pause to be respectful to Wikipedia's API
        if (wikiTitle) await new Promise(r => setTimeout(r, 120));
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
