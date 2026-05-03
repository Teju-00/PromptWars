export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  readTime: string;
  content: string;
  imageUrl: string;
}

export const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    title: 'Model Code of Conduct: What Every Voter Should Know',
    category: 'Election Law',
    date: 'May 02, 2026',
    excerpt: 'The Election Commission has released updated guidelines for digital campaigning and social media ethics.',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800&h=600',
    content: `
      The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India (ECI) for the conduct of political parties and candidates during elections. 
      
      This year, the ECI has placed a significant focus on digital campaigning. Key updates include:
      - Mandatory disclosure of AI-generated content in political advertisements.
      - Strict monitoring of social media platform algorithms for bias.
      - Guidelines for influencer-based campaigning.
      
      Voters are encouraged to report any violations through the cVIGIL app. Maintaining the integrity of the electoral process is a shared responsibility between the commission and the citizenry.
    `
  },
  {
    id: '2',
    title: 'New Voter Turnout Prediction Models Released',
    category: 'Data Analysis',
    date: 'May 01, 2026',
    excerpt: 'Statistical analysis suggests higher participation in urban centers due to the new digital registration initiative.',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536ad79?auto=format&fit=crop&q=80&w=800&h=600',
    content: `
      Data scientists have released a comprehensive analysis of early registration trends. The "Digital-First Elector" program has seen a 25% surge in registrations from the 18-25 age demographic in metropolitan areas.
      
      Predictive models suggest that overall voter turnout might exceed the records set in the 2019 general elections. The shift towards mobile-friendly registration and information access has significantly lowered the barrier to entry for first-time voters.
      
      However, rural turnout remains a point of focus, with infrastructure projects being fast-tracked to ensure booth accessibility.
    `
  },
  {
    id: '3',
    title: 'Understanding the EVM-VVPAT Verification Process',
    category: 'Guides',
    date: 'April 30, 2026',
    excerpt: 'Detailed breakdown of how votes are physically verified through the audit trail system.',
    readTime: '12 min read',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb193ed3?auto=format&fit=crop&q=80&w=800&h=600',
    content: `
      The Electronic Voting Machine (EVM) coupled with the Voter Verifiable Paper Audit Trail (VVPAT) ensures transparency in the voting process. 
      
      When a voter casts their vote on the ballot unit:
      1. A slip is printed in the VVPAT showing the candidate's name, serial number, and symbol.
      2. The slip remains visible behind a glass window for 7 seconds.
      3. The slip then automatically drops into a sealed box.
      
      This physical audit trail allows for manual verification of votes in specified polling stations, serving as a robust safeguard against technical tampering.
    `
  },
  {
    id: '4',
    title: 'Candidate Profile: Key Contenders for Local Assembly',
    category: 'Political',
    date: 'April 28, 2026',
    excerpt: 'A comprehensive look at the backgrounds and manifestos of the top three candidates in your region.',
    readTime: '15 min read',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800&h=600',
    content: `
      As the assembly elections approach, we profile the leading candidates competing for your vote. 
      
      Candidate A focuses on infrastructure development and technology hubs. Candidate B emphasizes social welfare programs and agricultural reform. Candidate C advocates for environmental sustainability and educational transparency.
      
      Understanding each candidate's manifesto is crucial for an informed vote. We provide a deep dive into their past performance, promised reforms, and public debate highlights.
    `
  }
];
