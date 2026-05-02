# AI Tool Reflection Document

This project gave me a much more realistic view of how AI tools fit into actual software development. Instead of using AI only for isolated code snippets, I used it as part of the full workflow for planning, debugging, implementation, and documentation. The two tools I relied on most were GitHub Copilot and Claude. Each one helped in different ways, and over time I learned that the quality of the outcome depended heavily on how clearly I defined the task and how actively I managed the tool.

## How I Used GitHub Copilot Throughout the Project

I used GitHub Copilot heavily during implementation because it handled a lot of the repetitive coding work and helped me move faster once I understood what needed to be built. In many cases, Copilot was useful for generating the first pass of components, service calls, DTO-related changes, and smaller pieces of logic that would have taken longer to type manually. It did not replace my understanding of the code, but it reduced the amount of mechanical work required to get features working.

Copilot also helped me understand how different parts of the system were connected. That was especially helpful in a full-stack project where a small change in one place often had effects somewhere else. For example, if I changed a DTO in the backend, I had to think about where that DTO came from, which controller or service used it, how the frontend consumed it, and whether the TypeScript types needed to be updated. Copilot was useful for tracing those relationships and helping me think through the impact of a change before I made it.

Another practical way I used Copilot was translating commands. A lot of examples online or in class materials assume Bash, but I was often working in PowerShell. Copilot helped me rewrite professor-provided Bash commands into PowerShell equivalents, especially for Azure-related commands or commands that were not explicitly given in the lab instructions. That saved time and reduced friction when working across different environments.

Finally, Copilot was helpful when I ran into bugs or confusing behavior. I could describe the issue and ask it to explain what was happening in more detail. Even when its answer was not perfect, it often gave me a clearer starting point for investigating the problem.

## How I Used Claude Across SDLC Phases

Claude was most useful when I treated it less like a code generator and more like a planning and reasoning partner. I took advice from Professor Chad in class and started by asking Claude to create a plan, or more specifically a minimal fix plan, before asking it to make changes. That approach worked well because it kept the tool focused on the smallest reasonable solution instead of encouraging large, unnecessary edits.

During requirements gathering and early design thinking, Claude helped expand on my ideas and identify gaps in my thinking. It could take a rough concept and turn it into a more structured plan. It was also useful for quickly identifying competitors or alternative solutions and helping me think about how my project could differentiate itself by solving a more specific need. That made it easier to move from a vague idea to a more actionable product direction.

During implementation, Claude was useful for reasoning through architecture and system behavior. It helped explain concepts like CORS, DTOs, state management, hooks, and how frontend and backend responsibilities should be separated. That mattered because this class covered a broad stack, and understanding the relationships between layers was just as important as writing the code itself.

I also benefited from guidance about how to structure agent files and skills efficiently so that the model would use tokens more effectively. That changed how I approached prompting and task breakdown. Instead of giving one broad instruction, I learned to separate planning from execution and keep the model focused on one concrete problem at a time.

One reason this process worked well is that the class already gave us a thoughtful stack to work with. I did not have to spend a large amount of time deciding between major technologies or trying to assemble a full architecture from scratch. Because of that, I could focus more on learning how to build within a real system and how to use AI effectively inside that system.

## Specific Examples of AI Assistance

Specific examples of prompts and outcomes are documented in [AI-USAGE.md](./AI-USAGE.md). That log shows concrete requests, implementation outcomes, and validation steps. One representative example was using AI assistance for the authentication user interface. The prompt focused on creating a plan for login and registration UX, placing a Login button in the navbar, matching the landing page theme, and then starting implementation.

The outcome was not just a single code snippet. It led to a structured set of changes across routing, navbar behavior, auth state management, frontend services, and testing. That example captures what was most valuable about AI in this project: it could help connect the request to the actual parts of the system that needed to change.

Another recurring example was asking AI to explain problems in detail before fixing them. Instead of only saying "solve this bug," I often asked what was likely happening and which files or layers were probably involved. That usually gave me better results because I could verify the reasoning first and then decide whether the proposed fix made sense.

## What Worked Well With AI Tools

The most effective strategy was asking the model to create a minimal plan before making changes. That one adjustment improved the quality of the results a lot. It prevented the tool from making broader edits than necessary and often surfaced a quick fix that I might have overlooked if I had gone straight into implementation.

AI was also very strong at explanation. It helped me understand technical topics that are easy to use without fully understanding, such as CORS behavior, DTO mapping, React state flow, and hooks. That made the tools more valuable for learning, not just for speed. When the explanation was good, I could apply that understanding in other parts of the project instead of only copying the immediate fix.

It also worked well when the task was clearly scoped. If I gave the model a narrow problem with enough context, it could usually produce something useful quickly. In those situations, AI felt less like a shortcut and more like a productivity multiplier.

## What Did Not Work Well or Where AI Struggled

AI struggled most when the task was too broad. If I gave it a vague request, it often did not know where to start and would try to inspect too much of the codebase. That could waste time, increase token usage, and sometimes lead it away from the actual issue. Broad prompts tended to produce broad answers.

It also had trouble with harder bugs, especially when the issue depended on subtle behavior across multiple layers. In some cases, the tool would over-solve the problem by proposing a larger refactor than was needed. That is part of why the minimal-plan approach became so important for me.

Another issue was that AI would sometimes spend too long "thinking" about simple tasks. Even when the problem was straightforward, the tool could still respond as if it needed to perform a major analysis. That made it important for me to keep requests focused and sized appropriately.

## Impact on Productivity and Learning

This class and project gave me much more real-world exposure to what it takes to build an actual system. Because of the broad stack we used, I gained experience thinking about the frontend, backend, API boundaries, data flow, and deployment concerns together instead of as isolated topics. AI helped accelerate that process, but the bigger value was that it helped me see how the pieces fit together.

The systems thinking I developed during this project was especially valuable. Understanding how components interact, and how one change can affect another layer, is something I have already been able to apply in other classes. It also improved how I use AI, because I learned to ask better questions when I understand the system structure better.

I also learned a lot about building agents productively and using AI efficiently. I had experimented with agents before, but this project improved my understanding of how to guide them, how to break work into steps, and how to reduce wasted effort. That has had a noticeable impact on my productivity. I also appreciated being exposed to how a more senior developer thinks about open source code, problem solving, and general software development decisions. That perspective helped me understand not just what to build, but how developers approach unfamiliar systems.

## Lessons Learned About AI-Assisted Development

The biggest lesson I learned is that you need to use AI intentionally and not let AI use you. The tool can be very helpful, but only if I stay in control of the direction, scope, and quality of the work. If I stop thinking critically, the output gets worse even if it sounds confident.

Another lesson is the classic idea of garbage in, garbage out. The better my prompt, the better the result. Being specific about the goal, the constraints, and the level of change I wanted made a huge difference. Vague instructions usually created vague or overly broad solutions.

Finally, I learned that AI is most effective when it helps create a plan and then executes that plan in a controlled way. The planning step is what keeps the tool grounded. Overall, AI made me faster, but more importantly it made me more aware of how to structure work, reason about systems, and collaborate with tools instead of depending on them blindly.
