(function () {
  const FALLBACK = [
    "🎁 Emma just gifted a Fan Hoodie to Taylor Swift",
    "❤️ James sent a VIP Meet & Greet Pass for Cristiano Ronaldo",
    "⭐ Sophia ordered a Signed Photo Print for Beyoncé",
    "🎁 Oliver gifted a Collector's Bundle for Drake",
    "💝 Ava sent a Birthday Shoutout for Lionel Messi",
    "🎁 Liam gifted a Fan T-Shirt to Rihanna",
    "⭐ Isabella ordered a Digital Art Print for Ariana Grande",
    "❤️ Noah sent a Personalised Video Message for LeBron James",
    "🎁 Mia bought a Fan Card for MrBeast",
    "💫 Ethan ordered a Coffee Mug for The Weeknd",
    "🎁 Charlotte gifted a Signed Poster to Ed Sheeran",
    "❤️ Amelia sent a Fan Club Membership for Billie Eilish",
    "⭐ Lucas ordered a Phone Case for Dwayne Johnson",
    "🎁 Harper gifted a Tote Bag to Zendaya",
    "💝 Benjamin ordered a Collector's Puzzle for Adele",
    "🎁 Evelyn sent a Gift Card for Kylian Mbappé",
    "⭐ Henry downloaded a Wallpaper Pack for Olivia Rodrigo",
    "❤️ Luna made a Charity Donation in Serena Williams' name",
    "🎁 Jack sent a VIP Pass for Neymar Jr",
    "💫 Aria bought an Enamel Pin Set for Kylie Jenner",
    "🎁 Mason gifted a Fan Hoodie to Justin Bieber",
    "⭐ Grace ordered a Signed Poster for Roger Federer",
    "❤️ Ella sent a Birthday Shoutout for Shakira",
    "🎁 Ryan ordered a Coffee Mug for Post Malone",
    "💝 Chloe gifted a Wallpaper Pack for Bad Bunny",
    "⭐ Daniel bought a Fan T-Shirt for Stephen Curry",
    "🎁 Sofia sent a Gift Card for Doja Cat",
    "❤️ William ordered a Video Message for Simone Biles",
    "🎁 Abigail gifted a Tote Bag to Margot Robbie",
    "💫 Logan bought a Fan Club Membership for PewDiePie"
  ];

  async function initTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    let messages = [...FALLBACK];

    try {
      const data = await fetch('/api/orders/activity').then(r => r.json());
      if (Array.isArray(data) && data.length >= 5) {
        const live = data.map(a => `🎁 ${a.buyer} just gifted ${a.product}`);
        messages = [...live, ...FALLBACK.slice(0, Math.max(0, 20 - live.length))];
      }
    } catch (_) { /* use fallback */ }

    const all = [...messages, ...messages];
    track.innerHTML = all.map(m =>
      `<span class="ticker-item">${m}</span><span class="ticker-sep">·</span>`
    ).join('');

    track.style.animationDuration = Math.max(40, messages.length * 4) + 's';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTicker);
  } else {
    initTicker();
  }
})();
