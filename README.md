# Bullshit Detektor

Namn på alla deltagare: Erik Eisler

### Tävlar i kategori: Bästa AI-tillämpning, Bästa innovativa idé och bästa helhetslösning

## Projekt & Teknisk- beskrivning

Här skriver ni vad ni har gjort, försök att formulera det så att det blir relevant för kategorin ni tänker att ni tävlar i.
T.ex. om ni har fokuserat på just UI/UX så är det mer relevant än om ni 

Det ska även ingå en teknisk beskrivning, där ni beskriver en eller flera tekniska lösningar i projektet. Ni skall beskriva funktionen av den tekniska lösningen och hur den används i projektet. Ju tydligare beskrivning desto enklare att bedöma den tekniska lösningen. Beskrivningen skall vara förståelig även för personer som inte kan programmera.

Jag har skapat en webbsida med react.js där man kan ladda upp sin text och sedan kommer AI att analysera den för att föreslå förbättringar, den fokuserar mestadels på “Bullshit” alltså svaga eller ologiska argument, onödiga ord och repetitiv argumentation men kommer även att föreslå lösningar på grammatiska fel. Man kan se vad som anses dåligt i texten och sedan kan man se AI:s förslag och välja vad man vill och inte vill implementera. Fördelen med detta i jämförelse med att bara be AI att skriva om din text är att du kan välja vad som faktiskt ändras och vara med i processen, inte bara blir slutprodukten bättre, du lär också dig vad du gör fel och nya ord eller formuleringar. Den är väldigt användbar för att lära sig om man har några dåliga skrivvanor.



### Externt producerade komponenter

Här presenterar ni saker som ni har laddat ner och använt för att bygga ert arbete. Beskriv också i vilken utsträckning de behövs för projektet.

Projektet är byggt i React och använder Next.js, Tailwind och Gemini.

### Install

Här skriver ni vad vi i juryn behöver göra för att kunna köra ert program / app / webbsida

Här är det lite jobbigt, projektet är skapat i React alltså måste den köras på localhost, jag använde Visual Studio Code där man kan ladda in koden och sedan köra “npm run dev” i terminalen så kommer man starta den på localhost. Problemet som dock uppstår är att den använder en API kod så antingen måste du skaffa en egen, går att göra gratis från google AI studio och sedan skapa en  “.env.local” i root och skriva in “GOOGLE_API_KEY=nyckel_här”.

SIMPLARE OTEKNISK METOD: du kan använda mitt exempel där AI redan använts, då kör du programmet och sedan trycker på knappen uppe till höger och kopierar in följande text och json kod i rätt rutor, då kan du skippa AI delen och testa programmets funktion, däremot kommer du missa min fina loading overlay :(

Text:

Nuclear power is the future!
You have probably used electricity at some point in your life, but you might not know that around 60% of the energy created in the world comes from fossil fuels according to the International Energy Agency. These fuels are next to impossible to recreate once they’re used, which in turn suggests that at some point when it runs out, we need an updated energy source, and I believe that further developing nuclear power is the solution.

Nuclear reactors are similar to a steam engine, using heat to turn water into steam, which then creates movement that is converted to electricity. The difference is that instead of using coal to create heat, nuclear reactors use fission, the process of splitting atoms. When it comes to the substance used in fission, the U.S. Energy Information Administration (2023) says that: 
“Uranium is the most-used fuel by nuclear power plants for nuclear fission. Uranium is a common metal found in rocks all over the world.”
That means that the power source for nuclear reactors is cheap and reliable. 
Splitting a large atom into two smaller atoms releases a great amount of energy in the form of heat. This indicates that due to the high energy density in uranium, a nuclear power plant generates about double the energy of a coal power plant, as well as generating 3 to 4 times as much electricity as a renewable energy power plant all according to the U.S. Department of Energy (2021).

Another argument that could be made for nuclear power is that it doesn’t actually produce any exhaust gases unlike other energy sources, which makes it not only more efficient, but also better for the environment than most other energy sources like coal, natural gas, etc.
For these energy sources when the exhaust gas is released into the atmosphere, it creates a thick layer around the earth. This layer traps the heat coming from the sun which leads to a warmer environment. Now, you might not think that the earth getting a bit hotter is a big deal, but according to the United Nations: 
“Warmer temperatures over time are changing weather patterns and disrupting the usual balance of nature. This poses many risks to human beings and all other forms of life on Earth” 
In conclusion, warmer temperatures lead to disruption in weather and nature, which in turn leads to risks such as more severe storms, rising sea levels, and many more.
This is why investing in the research and development of safe  and reliable nuclear power is a step towards a better future.

Even though there are multiple reasons to continue developing nuclear power, many will be quick to point out the multiple dangers of nuclear power. An example of this would be the tragedy that happened in Chernobyl, where a reactor went out of control and blew up, releasing massive amounts of radiation in the surrounding area which still affects us today.
But this tragedy is the exact reason I believe that it’s important that we keep researching and developing nuclear power. Because one day when all the fossil fuels like coal and oil are used up, and land is already occupied with thousands of wind and hydroelectric power plants, we will have no choice, but to resort to nuclear power. On that very day, I am sure that it’s best if we already have a developed system for nuclear power, so that we can prevent an accident like Chernobyl from ever happening again.

To summarize, it is my belief that we need to invest more resources in the research and development of nuclear power, because it’s one of the most effective and reliable ways to generate energy. So instead of fearing nuclear power, maybe we should focus on improving it, for a safer and cleaner future!

JSON:

[
  {
    "snippet": "You have probably used electricity at some point in your life, but you might not know that around",
    "reason": "Conversational hook serves as irrelevant filler in an academic context.",
    "type": "filler",
    "severity": "critical",
    "replacement": "Around"
  },
  {
    "snippet": "next to impossible to recreate once they’re used, which in turn suggests that at some point when it runs out, we need",
    "reason": "Extremely verbose and colloquial phrasing for 'non-renewable'.",
    "type": "weak",
    "severity": "warning",
    "replacement": "non-renewable, suggesting that as reserves deplete, we require"
  },
  {
    "snippet": ", and I believe that",
    "reason": "First-person opinion weakens the objective tone.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "; therefore,"
  },
  {
    "snippet": "The difference is that instead",
    "reason": "Wordy transition.",
    "type": "filler",
    "severity": "suggestion",
    "replacement": "However, instead"
  },
  {
    "snippet": "When it comes to the substance used in fission,",
    "reason": "Wordy introductory phrase.",
    "type": "filler",
    "severity": "warning",
    "replacement": "Regarding the fuel,"
  },
  {
    "snippet": "That means that",
    "reason": "Weak conversational connective.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "Consequently,"
  },
  {
    "snippet": "This indicates that due to",
    "reason": "Redundant phrasing.",
    "type": "filler",
    "severity": "suggestion",
    "replacement": "Because of"
  },
  {
    "snippet": "Another argument that could be made for nuclear power is that it doesn’t actually produce",
    "reason": "Passive, wordy, and filler-heavy introduction.",
    "type": "filler",
    "severity": "critical",
    "replacement": "Furthermore, nuclear power produces"
  },
  {
    "snippet": "unlike other energy sources, which makes it not only more efficient, but also better for the environment than most other energy sources like coal, natural gas, etc.",
    "reason": "Circular repetition of 'other energy sources' and vague listing.",
    "type": "circular",
    "severity": "warning",
    "replacement": "making it cleaner and more efficient than fossil fuels."
  },
  {
    "snippet": "For these energy sources when",
    "reason": "Clunky, redundant syntax.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "When"
  },
  {
    "snippet": "Now, you might not think that the earth getting a bit hotter is a big deal, but",
    "reason": "Conversational, second-person address is inappropriate for academic writing.",
    "type": "filler",
    "severity": "warning",
    "replacement": "While a slight temperature increase may appear insignificant,"
  },
  {
    "snippet": "In conclusion, warmer temperatures lead to disruption in weather and nature, which in turn leads to risks such as",
    "reason": "Misuse of 'In conclusion' (not the end of paper) and wordy chain of causality.",
    "type": "weak",
    "severity": "warning",
    "replacement": "Ultimately, warming disrupts ecosystems, creating risks such as"
  },
  {
    "snippet": ", and many more",
    "reason": "Vague filler.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "."
  },
  {
    "snippet": "many will be quick to point out",
    "reason": "Wordy idiom.",
    "type": "filler",
    "severity": "suggestion",
    "replacement": "critics often highlight"
  },
  {
    "snippet": "An example of this would be the tragedy that happened in",
    "reason": "Passive and verbose.",
    "type": "filler",
    "severity": "warning",
    "replacement": "For instance,"
  },
  {
    "snippet": "But this tragedy is the exact reason I believe that it’s important that we keep",
    "reason": "First-person subjective phrasing and wordiness.",
    "type": "weak",
    "severity": "warning",
    "replacement": "However, this tragedy underscores the need to continue"
  },
  {
    "snippet": "Because one day when all the fossil fuels like coal and oil are used up,",
    "reason": "Informal storytelling tone.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "Once fossil fuel reserves are depleted"
  },
  {
    "snippet": "On that very day, I am sure that it’s best if we already have",
    "reason": "Melodramatic and subjective.",
    "type": "weak",
    "severity": "warning",
    "replacement": "Therefore, we must establish"
  },
  {
    "snippet": "To summarize, it is my belief that",
    "reason": "Redundant announcement of opinion.",
    "type": "filler",
    "severity": "suggestion",
    "replacement": "In summary,"
  },
  {
    "snippet": "maybe we should",
    "reason": "Hedging language weakens the thesis.",
    "type": "weak",
    "severity": "suggestion",
    "replacement": "we must"
  }
]

