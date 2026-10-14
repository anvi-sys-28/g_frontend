import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BallDefinition {
  over: number;
  ballInOver: number;
  striker: string;
  nonStriker: string;
  bowler: string;
  runsBat: number;
  extrasType?: 'wide' | 'noBall' | 'bye' | 'legBye' | null;
  extrasRuns?: number;
  isWicket?: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run out' | 'stumped';
  dismissedPlayer?: string;
  commentary: string;
}

// Generate complete balls
const ballsDef: BallDefinition[] = [];

// Helper to push ball
function addBall(b: BallDefinition) {
  ballsDef.push(b);
}

// Over 1 (0.1 - 0.6): Shaheen Afridi to KL Rahul & Rohit Sharma
addBall({ over: 0, ballInOver: 1, striker: 'KL Rahul', nonStriker: 'Rohit Sharma', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Shaheen angles it across off on a good length, defended solidly to point.' });
addBall({ over: 0, ballInOver: 2, striker: 'KL Rahul', nonStriker: 'Rohit Sharma', bowler: 'Shaheen Afridi', runsBat: 1, commentary: 'Fuller outside off, steered through backward point for a single. India get off the mark.' });
addBall({ over: 0, ballInOver: 3, striker: 'Rohit Sharma', nonStriker: 'KL Rahul', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Swing back in! Rohit defends off the inner half of the bat towards midwicket.' });
addBall({ over: 0, ballInOver: 4, striker: 'Rohit Sharma', nonStriker: 'KL Rahul', bowler: 'Shaheen Afridi', runsBat: 2, commentary: 'Flicked nicely off the pads behind square, easy two runs taken.' });
addBall({ over: 0, ballInOver: 5, striker: 'Rohit Sharma', nonStriker: 'KL Rahul', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Beaten! Extra bounce outside off stump, Rohit plays away from the body and misses.' });
addBall({ over: 0, ballInOver: 6, striker: 'Rohit Sharma', nonStriker: 'KL Rahul', bowler: 'Shaheen Afridi', runsBat: 1, commentary: 'Drop and run to mid-off. Rohit keeps the strike.' });

// Over 2 (1.1 - 1.6): Naseem Shah (WICKET KL Rahul!)
addBall({ over: 1, ballInOver: 1, striker: 'Rohit Sharma', nonStriker: 'KL Rahul', bowler: 'Naseem Shah', runsBat: 1, commentary: 'Pushed gently down towards third man for a single.' });
addBall({ over: 1, ballInOver: 2, striker: 'KL Rahul', nonStriker: 'Rohit Sharma', bowler: 'Naseem Shah', runsBat: 0, isWicket: true, wicketType: 'bowled', dismissedPlayer: 'KL Rahul', commentary: 'OUT! Inside edge onto the stumps! Naseem Shah strikes! Rahul is tentative and drags it back on!' });
addBall({ over: 1, ballInOver: 3, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Naseem Shah', runsBat: 0, commentary: 'Virat Kohli comes to the crease. Good length, pushed towards extra cover.' });
addBall({ over: 1, ballInOver: 4, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Naseem Shah', runsBat: 0, commentary: 'Beaten on the outside edge! Sharp seam movement away from off stump.' });
addBall({ over: 1, ballInOver: 5, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Naseem Shah', runsBat: 1, commentary: 'Tucked round the corner to fine leg for a single.' });
addBall({ over: 1, ballInOver: 6, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Naseem Shah', runsBat: 0, commentary: 'Full and straight, defended back down the track to Naseem.' });

// Over 3 (2.1 - 2.6): Shaheen Afridi
addBall({ over: 2, ballInOver: 1, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Shaheen beats Kohli with raw pace outside off.' });
addBall({ over: 2, ballInOver: 2, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Shaheen Afridi', runsBat: 1, commentary: 'Guided through cover point for a single.' });
addBall({ over: 2, ballInOver: 3, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Good length ball on off, Rohit defends to cover.' });
addBall({ over: 2, ballInOver: 4, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Another tight delivery, no run.' });
addBall({ over: 2, ballInOver: 5, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Shaheen Afridi', runsBat: 1, commentary: 'Glanced to deep square leg for one.' });
addBall({ over: 2, ballInOver: 6, striker: 'Virat Kohli', nonStriker: 'Rohit Sharma', bowler: 'Shaheen Afridi', runsBat: 0, commentary: 'Left alone outside off stump.' });

// Over 4 (3.1 - 3.6): Haris Rauf (WICKET Rohit Sharma!)
addBall({ over: 3, ballInOver: 1, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Haris Rauf starts with 148 kph thunderbolt! Defended.' });
addBall({ over: 3, ballInOver: 2, striker: 'Rohit Sharma', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, isWicket: true, wicketType: 'caught', dismissedPlayer: 'Rohit Sharma', commentary: 'OUT! Caught in the slips! Rohit edges to Iftikhar at first slip! 145 kph snorter and Rohit is gone for 4!' });
addBall({ over: 3, ballInOver: 3, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 4, commentary: 'FOUR! First ball boundary for Suryakumar! Glorious drive past extra cover!' });
addBall({ over: 3, ballInOver: 4, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Bouncer! Suryakumar ducks under the bumper.' });
addBall({ over: 3, ballInOver: 5, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 4, commentary: 'FOUR! Upper cut over third man! Suryakumar showing his trademark audacity!' });
addBall({ over: 3, ballInOver: 6, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 1, commentary: 'Quick single to mid-on to retain the strike.' });

// Over 5 (4.1 - 4.6): Naseem Shah
addBall({ over: 4, ballInOver: 1, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Naseem Shah', runsBat: 1, commentary: 'Dabbed into the off side for a brisk single.' });
addBall({ over: 4, ballInOver: 2, striker: 'Virat Kohli', nonStriker: 'Suryakumar Yadav', bowler: 'Naseem Shah', runsBat: 0, commentary: 'Kohli defends firmly to midwicket.' });
addBall({ over: 4, ballInOver: 3, striker: 'Virat Kohli', nonStriker: 'Suryakumar Yadav', bowler: 'Naseem Shah', runsBat: 1, commentary: 'Worked towards fine leg for a single.' });
addBall({ over: 4, ballInOver: 4, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Naseem Shah', runsBat: 4, commentary: 'FOUR! Leans back and ramps it over the keeper head to the ropes!' });
addBall({ over: 4, ballInOver: 5, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Naseem Shah', runsBat: 0, commentary: 'Beaten! Extra seam movement beats the outside edge.' });
addBall({ over: 4, ballInOver: 6, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Naseem Shah', runsBat: 1, commentary: 'Single down to third man.' });

// Over 6 (5.1 - 5.6): Haris Rauf (WICKET Suryakumar Yadav!)
addBall({ over: 5, ballInOver: 1, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: '149 kph delivery! Defended back to bowler.' });
addBall({ over: 5, ballInOver: 2, striker: 'Suryakumar Yadav', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, isWicket: true, wicketType: 'caught', dismissedPlayer: 'Suryakumar Yadav', commentary: 'OUT! Massive blow for India! Suryakumar gloves a lifting delivery to Rizwan! India in deep trouble at 31/3!' });
addBall({ over: 5, ballInOver: 3, striker: 'Axar Patel', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Axar promoted to number 5. Defended.' });
addBall({ over: 5, ballInOver: 4, striker: 'Axar Patel', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Solid forward defence towards mid-off.' });
addBall({ over: 5, ballInOver: 5, striker: 'Axar Patel', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Swinging delivery beats Axar.' });
addBall({ over: 5, ballInOver: 6, striker: 'Axar Patel', nonStriker: 'Virat Kohli', bowler: 'Haris Rauf', runsBat: 0, commentary: 'Dot ball to finish a fiery over. India 31/3 after the Powerplay.' });

// Over 7 (6.1 - 6.6): Shadab Khan (WICKET Axar Patel Run Out!)
addBall({ over: 6, ballInOver: 1, striker: 'Virat Kohli', nonStriker: 'Axar Patel', bowler: 'Shadab Khan', runsBat: 0, commentary: 'Leg break outside off, punched to extra cover.' });
addBall({ over: 6, ballInOver: 2, striker: 'Virat Kohli', nonStriker: 'Axar Patel', bowler: 'Shadab Khan', runsBat: 0, isWicket: true, wicketType: 'run out', dismissedPlayer: 'Axar Patel', commentary: 'OUT! Total disaster! Axar is run out! Mix up between the wickets and Babar strikes the stumps! India 31/4!' });
addBall({ over: 6, ballInOver: 3, striker: 'Hardik Pandya', nonStriker: 'Virat Kohli', bowler: 'Shadab Khan', runsBat: 1, commentary: 'Hardik walks in and gets off the mark with a clip to midwicket.' });
addBall({ over: 6, ballInOver: 4, striker: 'Virat Kohli', nonStriker: 'Hardik Pandya', bowler: 'Shadab Khan', runsBat: 1, commentary: 'Kohli pushes down to long-on for a single.' });
addBall({ over: 6, ballInOver: 5, striker: 'Hardik Pandya', nonStriker: 'Virat Kohli', bowler: 'Shadab Khan', runsBat: 1, commentary: 'Worked towards deep square leg.' });
addBall({ over: 6, ballInOver: 6, striker: 'Virat Kohli', nonStriker: 'Hardik Pandya', bowler: 'Shadab Khan', runsBat: 1, commentary: 'Single to long-off. Partnership underway.' });

// Over 8 - Over 15: Steady building
const midOvers = [
  // Over 8: Mohammad Nawaz (spin from both ends)
  [
    { r: 1, c: 'Tapped into the covers for a single.' },
    { r: 1, c: 'Worked off the pads behind square.' },
    { r: 0, c: 'Defended straight.' },
    { r: 1, c: 'Single to long-on.' },
    { r: 1, c: 'Pushed to deep point.' },
    { r: 1, c: 'Kohli keeps the strike with a single.' }
  ],
  // Over 9: Shadab Khan
  [
    { r: 1, c: 'Rotated with ease to deep cover.' },
    { r: 2, c: 'Hardik clips through midwicket, excellent running brings two.' },
    { r: 1, c: 'Single down to long-off.' },
    { r: 0, c: 'Googly from Shadab, Kohli defends carefully.' },
    { r: 1, c: 'Single to deep midwicket.' },
    { r: 1, c: 'Single to deep square leg.' }
  ],
  // Over 10: Mohammad Nawaz
  [
    { r: 1, c: 'Pushed into the gap at point.' },
    { r: 1, c: 'Kohli milks a single to long-on.' },
    { r: 4, c: 'FOUR! Hardik steps out and smashes Nawaz straight back over his head!' },
    { r: 1, c: 'Sensibly pushed down to long-off for one.' },
    { r: 1, c: 'Turned into the on-side for a run.' },
    { r: 1, c: 'Single to round out the 10th over. India 58/4 at the halfway mark.' }
  ],
  // Over 11: Shadab Khan
  [
    { r: 1, c: 'Leg break worked to deep midwicket.' },
    { r: 1, c: 'Driven down to long-on.' },
    { r: 1, c: 'Swept firmly to deep square.' },
    { r: 1, c: 'Kohli finds the gap at deep cover.' },
    { r: 2, c: 'Good running between wickets, two more to the total.' },
    { r: 1, c: 'Single to long-off.' }
  ],
  // Over 12: Mohammad Nawaz (Big over! 3 SIXES!)
  [
    { r: 6, c: 'SIX! Hardik launches Nawaz into the grandstand over long-on! Massive hit!' },
    { r: 0, c: 'Darted in quicker on off stump, defended.' },
    { r: 6, c: 'SIX! Another one! Hardik clobbers it over deep midwicket! The crowd erupts!' },
    { r: 1, c: 'Nawaz fires it outside off, guided to deep backward point for one.' },
    { r: 6, c: 'SIX! Virat Kohli joins the party! Lofted inside-out over long-off! What an over!' },
    { r: 1, c: 'Single to long-on. 20 runs from the 12th over! Game on!' }
  ],
  // Over 13: Naseem Shah
  [
    { r: 1, c: 'Naseem returns. Hardik pushes to cover for a run.' },
    { r: 1, c: 'Kohli dabs to third man for a single.' },
    { r: 0, c: 'Good bouncer, Hardik ducks.' },
    { r: 1, c: 'Worked off the hips to fine leg.' },
    { r: 2, c: 'Kohli turns this into the gap at midwicket and charges for two!' },
    { r: 1, c: 'Single to mid-off.' }
  ],
  // Over 14: Shadab Khan
  [
    { r: 1, c: 'Shadab bowling his final over. Single to long-on.' },
    { r: 1, c: 'Kohli cuts to deep point.' },
    { r: 1, c: 'Hardik takes a single to long-off.' },
    { r: 1, c: 'Pushed into the cover region.' },
    { r: 1, c: 'Worked towards backward square leg.' },
    { r: 1, c: 'Single down the ground. Shadab finishes 0/21 from 4 overs.' }
  ],
  // Over 15: Haris Rauf
  [
    { r: 1, c: 'Rauf steaming in. Guided down to third man for one.' },
    { r: 1, c: 'Single to fine leg.' },
    { r: 0, c: 'Fast yorker dug out back to the bowler.' },
    { r: 1, c: 'Pushed past the bowler for one.' },
    { r: 1, c: 'Single to deep midwicket. 100 up for India!' },
    { r: 2, c: 'Superb running again by Kohli and Pandya, two runs to finish.' }
  ],
  // Over 16: Shaheen Afridi
  [
    { r: 1, c: 'Shaheen returns for death overs. Driven to long-off for a single.' },
    { r: 4, c: 'FOUR! Kohli punches Shaheen through extra cover! Pure elegance!' },
    { r: 1, c: 'Drop and run to midwicket.' },
    { r: 4, c: 'FOUR! Hardik swivels and pulls behind square leg to the boundary!' },
    { r: 1, c: 'Single down to third man.' },
    { r: 2, c: 'Kohli clips firmly and pushes hard for two! India 119/4.' }
  ],
  // Over 17: Naseem Shah
  [
    { r: 1, c: 'Full on middle, pushed to mid-on.' },
    { r: 1, c: 'Kohli opens the face, down to third man.' },
    { r: 1, c: 'Single to deep midwicket.' },
    { r: 1, c: 'Kohli brings up his fifty! 50 off 43 balls! A masterclass!' },
    { r: 1, c: 'Hardik clips to fine leg.' },
    { r: 1, c: 'Single to long-off. 6 off the over.' }
  ],
  // Over 18: Shaheen Afridi
  [
    { r: 1, c: 'Full toss driven to long-on for one.' },
    { r: 4, c: 'FOUR! Kohli carves it over backward point! Phenomenal placement!' },
    { r: 1, c: 'Single into the covers.' },
    { r: 4, c: 'FOUR! Kohli clears front leg and plonks it through midwicket!' },
    { r: 1, c: 'Single down the ground.' },
    { r: 4, c: 'FOUR! Hardik edges past keeper to the boundary! 15 runs from the over!' }
  ],
  // Over 19: Haris Rauf (The iconic Kohli sixes!)
  [
    { r: 1, c: 'Yorker on middle, Hardik jams it to long-on for one.' },
    { r: 1, c: 'Kohli swings to deep midwicket, just a single.' },
    { r: 1, c: 'Hardik takes a single to long-off. India need 28 off 8 balls.' },
    { r: 0, c: 'Dot ball! Short ball beats Kohli outside off! Tension builds!' },
    { r: 6, c: 'SIX! OH MY WORD! SHOT OF THE CENTURY! Virat Kohli stands tall and lofts Haris Rauf straight back over his head! Incredible!' },
    { r: 6, c: 'SIX! VIRAT KOHLI FLICKS IT OVER FINE LEG! Unbelievable scenes at the MCG! Two sixes in two balls!' }
  ]
];

// Populate overs 8 through 19
let currentStriker = 'Hardik Pandya';
let currentNonStriker = 'Virat Kohli';

for (let i = 0; i < midOvers.length; i++) {
  const overIdx = 7 + i; // Over 8 has over index 7
  const bowlerNames = [
    'Mohammad Nawaz', 'Shadab Khan', 'Mohammad Nawaz', 'Shadab Khan',
    'Mohammad Nawaz', 'Naseem Shah', 'Shadab Khan', 'Haris Rauf',
    'Shaheen Afridi', 'Naseem Shah', 'Shaheen Afridi', 'Haris Rauf'
  ];
  const bName = bowlerNames[i];
  const overData = midOvers[i];

  for (let b = 0; b < overData.length; b++) {
    const ballObj = overData[b];
    addBall({
      over: overIdx,
      ballInOver: b + 1,
      striker: currentStriker,
      nonStriker: currentNonStriker,
      bowler: bName,
      runsBat: ballObj.r,
      commentary: ballObj.c
    });

    // Strike rotation on odd runs
    if (ballObj.r % 2 === 1) {
      const temp = currentStriker;
      currentStriker = currentNonStriker;
      currentNonStriker = temp;
    }
  }

  // Over end strike change
  const temp = currentStriker;
  currentStriker = currentNonStriker;
  currentNonStriker = temp;
}

// Over 20: Mohammad Nawaz (Thrilling final over, 16 needed!)
// 19.1: Hardik caught
addBall({ over: 19, ballInOver: 1, striker: 'Hardik Pandya', nonStriker: 'Virat Kohli', bowler: 'Mohammad Nawaz', runsBat: 0, isWicket: true, wicketType: 'caught', dismissedPlayer: 'Hardik Pandya', commentary: 'OUT! Hardik miscues a slog into the off side, Babar takes the catch! Hardik falls for 40! India need 16 off 5!' });
// 19.2: Dinesh Karthik 1 run
addBall({ over: 19, ballInOver: 2, striker: 'Dinesh Karthik', nonStriker: 'Virat Kohli', bowler: 'Mohammad Nawaz', runsBat: 1, commentary: 'Dinesh Karthik takes a single to deep midwicket. Kohli back on strike! 15 needed off 4!' });
// 19.3: Kohli 2 runs
addBall({ over: 19, ballInOver: 3, striker: 'Virat Kohli', nonStriker: 'Dinesh Karthik', bowler: 'Mohammad Nawaz', runsBat: 2, commentary: 'Kohli drives to deep cover and they sprint back for two! 13 needed off 3!' });
// 19.4: Kohli SIX on NO-BALL!
addBall({ over: 19, ballInOver: 4, striker: 'Virat Kohli', nonStriker: 'Dinesh Karthik', bowler: 'Mohammad Nawaz', runsBat: 6, extrasType: 'noBall', extrasRuns: 1, commentary: 'NO BALL AND A SIX! Full toss above waist height and Kohli hoicks it over deep square leg! Free hit coming up! 6 needed off 3!' });
// 19.4 re-bowl 1: Wide!
addBall({ over: 19, ballInOver: 4, striker: 'Virat Kohli', nonStriker: 'Dinesh Karthik', bowler: 'Mohammad Nawaz', runsBat: 0, extrasType: 'wide', extrasRuns: 1, commentary: 'WIDE! Nawaz fires it wide outside off trying to stay away from the arc! Free hit remains! 5 needed off 3!' });
// 19.4 re-bowl 2: Bowled off Free hit, run 3 byes!
addBall({ over: 19, ballInOver: 4, striker: 'Virat Kohli', nonStriker: 'Dinesh Karthik', bowler: 'Mohammad Nawaz', runsBat: 0, extrasType: 'bye', extrasRuns: 3, commentary: 'BOWLED OFF THE FREE HIT! The ball ricochets off the stumps down to third man! Batters run three byes! 2 needed off 2 balls!' });
// 19.5: Dinesh Karthik stumped
addBall({ over: 19, ballInOver: 5, striker: 'Dinesh Karthik', nonStriker: 'Virat Kohli', bowler: 'Mohammad Nawaz', runsBat: 0, isWicket: true, wicketType: 'stumped', dismissedPlayer: 'Dinesh Karthik', commentary: 'STUMPED! Karthik steps out, misses, and Rizwan whips the bails off! 2 needed off 1 ball! Ashwin comes to the crease!' });
// 19.6: Nawaz fires wide down leg!
addBall({ over: 19, ballInOver: 6, striker: 'Ravichandran Ashwin', nonStriker: 'Virat Kohli', bowler: 'Mohammad Nawaz', runsBat: 0, extrasType: 'wide', extrasRuns: 1, commentary: 'WIDE! Ashwin leaves it with ice in his veins! Scores are level! 1 needed off 1 ball!' });
// 19.6 re-bowl: Ashwin lofts over mid-off for 1 run! INDIA WINS!
addBall({ over: 19, ballInOver: 6, striker: 'Ravichandran Ashwin', nonStriker: 'Virat Kohli', bowler: 'Mohammad Nawaz', runsBat: 1, commentary: 'ASHWIN DOES IT! Lofts it over mid-off, arms aloft! INDIA DEFEATS PAKISTAN BY 4 WICKETS AT THE MCG! VIRAT KOHLI 82 NOT OUT!' });

// Convert into full BallEvent list
let seq = 1;
let legalBallCount = 0;
const ballEvents = ballsDef.map((b) => {
  const isLegal = b.extrasType !== 'wide' && b.extrasType !== 'noBall';
  if (isLegal) legalBallCount++;
  const extrasRuns = b.extrasRuns ?? 0;
  const totalRuns = b.runsBat + extrasRuns;
  const isFour = b.runsBat === 4;
  const isSix = b.runsBat === 6;
  const isBoundary = isFour || isSix;

  const event = {
    sequence: seq++,
    ballId: `ball-${b.over}-${b.ballInOver}-${seq}`,
    matchId: 'match-ind-pak-2024',
    inningsId: 'innings-2',
    over: b.over,
    ballInOver: b.ballInOver,
    legalBallNumber: legalBallCount,
    displayOver: `${b.over}.${b.ballInOver}`,
    strikerId: `p-${b.striker.toLowerCase().replace(/\s+/g, '-')}`,
    strikerName: b.striker,
    nonStrikerId: `p-${b.nonStriker.toLowerCase().replace(/\s+/g, '-')}`,
    nonStrikerName: b.nonStriker,
    bowlerId: `b-${b.bowler.toLowerCase().replace(/\s+/g, '-')}`,
    bowlerName: b.bowler,
    runsBat: b.runsBat,
    extrasType: b.extrasType ?? null,
    extrasRuns: extrasRuns,
    totalRuns: totalRuns,
    isBoundary,
    isFour,
    isSix,
    isWicket: Boolean(b.isWicket),
    wicketType: b.wicketType,
    dismissedPlayerId: b.dismissedPlayer ? `p-${b.dismissedPlayer.toLowerCase().replace(/\s+/g, '-')}` : undefined,
    dismissedPlayerName: b.dismissedPlayer,
    commentary: b.commentary,
    timestamp: Date.now() - (ballsDef.length - seq) * 4000,
  };
  return event;
});

const outDir = path.join(__dirname, 'fixtures');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'ind-vs-pak-t20.json'),
  JSON.stringify(ballEvents, null, 2),
  'utf-8'
);

console.log(`Successfully generated ${ballEvents.length} ball events into ind-vs-pak-t20.json`);
