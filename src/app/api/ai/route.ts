import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startZone, endZone, bridgeZone, flashlightZone, elapsedTime, history, hintsUsed } = body;

    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Construct system prompt with current state
    const startZoneStr = startZone.map((e: any) => `${e.name} (${e.speed}m)`).join(', ') || 'None';
    const endZoneStr = endZone.map((e: any) => `${e.name} (${e.speed}m)`).join(', ') || 'None';
    const bridgeZoneStr = bridgeZone.map((e: any) => `${e.name} (${e.speed}m)`).join(', ') || 'None';
    const historyStr = history.map((m: any, idx: number) => {
      const names = m.explorers.map((e: any) => `${e.speed}m`).join(' & ');
      return `#${idx + 1}: ${names} ${m.direction === 'forward' ? '➡️' : '⬅️'} (${m.time}m)`;
    }).join(', ') || 'None';

    const systemPrompt = `You are the Socratic Observer, a cognitive tutor for the CerebIQ platform.
Your task is to guide the user to solve the "Midnight Bridge" puzzle without giving away the answer.

Puzzle Rules:
- 4 explorers (speeds: 1m, 2m, 5m, 10m) must cross a bridge at midnight.
- Max 2 explorers on the bridge at a time.
- Flashlight is required to cross and must go back and forth.
- The crossing speed is the speed of the slower explorer.
- Goal: Cross everyone in exactly 17 minutes.

Current Puzzle State:
- Start side: [${startZoneStr}]
- Bridge side: [${bridgeZoneStr}]
- End side (Safe): [${endZoneStr}]
- Flashlight position: ${flashlightZone.toUpperCase()} side
- Elapsed time: ${elapsedTime} minutes
- Move history: ${historyStr}
- Hints requested so far: ${hintsUsed}

Socratic Guidelines:
1. NEVER reveal the sequence of moves to solve the puzzle.
2. NEVER tell the user what move to make next.
3. Help the user analyze their current situation by asking leading questions.
4. Point out logical contradictions:
   - If they are wasting time sending fast people together and slow people separately (e.g. sending 5m, then 10m separately takes 15m, which is too slow).
   - Prompt them to think about how to pair the two slowest people (5m and 10m) so their times overlap.
   - Prompt them to think about who is best suited to bring the flashlight back.
5. Keep your response brief, intellectually challenging, and academic (max 3 sentences).
`;

    if (!apiKey) {
      // Graceful fallback for local development without API key
      // Custom heuristic-based Socratic hints based on game state
      let hintMessage = "";
      
      if (history.length === 0) {
        hintMessage = "Consider the initial pairings. If you send the fastest explorers first, who will be available to bring the flashlight back? How can you minimize the return trips?";
      } else if (elapsedTime > 15) {
        hintMessage = "Time is running short. Look closely at the slower explorers (5m and 10m). If they cross separately, they consume 15 minutes of your total budget. How might you get them to cross together to 'hide' the 5-minute traveler's time?";
      } else if (flashlightZone === 'end' && endZone.some((e: any) => e.speed === 1 || e.speed === 2)) {
        hintMessage = "With the flashlight on the safe side, who is the most efficient choice to return it? Think about how the speed of the returner impacts your overall clock.";
      } else {
        hintMessage = "Examine your crossing history. To achieve exactly 17 minutes, the slow explorers (5m and 10m) must cross together, and your fastest explorers (1m and 2m) must handle the flashlight returns. How can you set up that sequence?";
      }

      // Simulate a small streaming delay
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(hintMessage));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Give me a subtle hint based on my current state.' }
        ],
        temperature: 0.7,
        max_tokens: 150,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${errText}` }, { status: response.status });
    }

    // Custom Server-Sent Events stream transformer to pipe OpenAI stream directly
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;
            if (cleanLine.startsWith('data: [DONE]')) continue;
            
            if (cleanLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanLine.slice(6));
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
