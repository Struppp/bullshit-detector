import "./globals.css";
import { Work_Sans } from 'next/font/google';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans', 
  display: 'swap',
});

export const metadata = {
  title: 'Bullshit Detector',
  description: 'Do you write a ton of bullshit, this will solve your issues so you can get an A+.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${workSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}