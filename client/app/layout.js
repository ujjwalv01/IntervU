import './globals.css';

export const metadata = {
  title: 'Intervu — AI Mock Interviews That Adapt To You',
  description: 'Practice real interviews with an AI interviewer that adapts to your answers. Get instant, detailed feedback on communication, depth, and structure.',
  openGraph: {
    title: 'Intervu — AI Mock Interviews That Adapt To You',
    description: 'Practice real interviews with an AI interviewer that adapts to your answers. Get instant, detailed feedback.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-animated min-h-screen">
        {children}
      </body>
    </html>
  );
}
