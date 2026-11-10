import type { Person, PersonKey, Role, RoleId, Mentor, SampleCand } from "../lib/types";

/* =====================================================================
   OFFICELIFE DATA  (everything here is hardcoded, so the app works with no AI)
   ===================================================================== */

export const UNIS: string[] = [
  "Wale University",
  "Ahmadu Bello University","Bayero University Kano","University of Lagos","University of Ibadan","Obafemi Awolowo University",
  "University of Nigeria, Nsukka","University of Benin","University of Ilorin","University of Port Harcourt","University of Jos",
  "University of Calabar","University of Uyo","University of Abuja","University of Maiduguri","Usmanu Danfodiyo University",
  "Federal University of Technology, Akure","Federal University of Technology, Minna","Federal University of Technology, Owerri",
  "Federal University of Agriculture, Abeokuta","Michael Okpara University of Agriculture, Umudike","Nnamdi Azikiwe University",
  "Federal University, Oye-Ekiti","Federal University, Lokoja","Federal University, Dutse","Federal University, Lafia",
  "Federal University, Wukari","Federal University, Otuoke","Federal University, Birnin Kebbi","Federal University, Gusau",
  "Federal University of Petroleum Resources, Effurun","Nigerian Defence Academy","National Open University of Nigeria",
  "Lagos State University","Lagos State University of Science and Technology","Ladoke Akintola University of Technology",
  "Olabisi Onabanjo University","Ekiti State University","Adekunle Ajasin University","Osun State University",
  "Delta State University","Rivers State University","Imo State University","Abia State University",
  "Enugu State University of Science and Technology","Ebonyi State University","Kogi State University","Benue State University",
  "Kwara State University","Nasarawa State University","Niger Delta University","Ambrose Alli University",
  "Tai Solarin University of Education","Kaduna State University","Abubakar Tafawa Balewa University","Gombe State University",
  "Umaru Musa Yar'adua University","Akwa Ibom State University","Chukwuemeka Odumegwu Ojukwu University",
  "Covenant University","Babcock University","Bowen University","Landmark University","Afe Babalola University",
  "Redeemer's University","Pan-Atlantic University","Lead City University","Ajayi Crowther University","American University of Nigeria",
  "Nile University of Nigeria","Baze University","Bells University of Technology","Crawford University","Crescent University",
  "Caleb University","Elizade University","Fountain University","Godfrey Okoye University","Igbinedion University",
  "Joseph Ayo Babalola University","McPherson University","Mountain Top University","Oduduwa University","Paul University",
  "Rhema University","Salem University","Summit University","Wesley University","Achievers University","Adeleke University",
  "Al-Hikmah University","Anchor University","Augustine University","Benson Idahosa University","Bingham University",
  "Dominion University","Edwin Clark University","Hallmark University","Kings University",
  "A polytechnic or college","Other Nigerian university","Not a student (graduate or job seeker)"
];

export const LEVELS: string[] = ["100 level","200 level","300 level","400 level","500 level","Graduate (NYSC or waiting)","Graduated"];

export const PEOPLE: Record<PersonKey, Person> = {
  chidi:{name:"Chidi Eze",role:"Head of Product",color:"#5B2BC4",ini:"CE"},
  tunde:{name:"Tunde Alabi",role:"Engineering Lead",color:"#0B6E5B",ini:"TA"},
  amina:{name:"Amina Bello",role:"Product Designer",color:"#B4326E",ini:"AB"},
  bisi:{name:"Bisi Okon",role:"QA Engineer",color:"#A65A00",ini:"BO"},
  ngozi:{name:"Ngozi Obi",role:"Head of Data",color:"#0A5FA8",ini:"NO"},
  femi:{name:"Femi Adeyemi",role:"Operations Manager",color:"#8A3B12",ini:"FA"}
};

export const DAY_PLAN: [string, string, string][] = [
  ["9:00 AM","Clock in","Your arrival is logged as early, on time or late."],
  ["9:30 AM","Team standup","Messages from your manager and teammates arrive in chat."],
  ["10:00 AM","Main task","Do the work, upload a file or type your answer, and get reviewed."],
  ["11:00 AM","Manager follow-up","You explain your thinking in your own words."],
  ["11:30 AM","Urgent decision","Two things need you at once. Pick one before the clock runs out."],
  ["2:30 PM","Afternoon check-in","A short pop-up question tests your thinking."],
  ["5:00 PM","Clock out","Your day report is saved to your certificate."]
];

/* ---------- ROLES ---------- */
export const ROLES: Record<RoleId, Role> = {
/* ============================ PROJECT MANAGER ============================ */
pm:{
  id:"pm", title:"Project Manager", short:"PM", manager:"chidi", cls:"",
  blurb:"Run the launch of a delivery app for a Lagos logistics startup.",
  learn:["Plan a project with clear milestones, owners and risks","Prioritise when two urgent things collide","Communicate with developers, designers and clients","Make a launch decision and defend it"],
  skills:["Project planning","Prioritisation","Risk management","Stakeholder communication","Decision-making","Time management"],
  jobs:"Project Coordinator, Product Associate, Operations Analyst",
  days:[
  {theme:"Get the plan straight",steps:[
    {t:"09:05",type:"msg",from:"chidi",text:"Good morning, and welcome to Tembea Logistics. We ship Driver App 2.0 in two weeks and I need you running the project. Standup is at 9:30."},
    {t:"09:30",type:"msg",from:"tunde",text:"Standup update: login and maps are done. The payments screen is 3 days behind because the bank API keeps timing out."},
    {t:"09:35",type:"msg",from:"amina",text:"Designs for the delivery summary are ready. I need feedback before noon or I cannot hand over to Tunde today."},
    {t:"09:45",type:"reply",from:"chidi",text:"Quick one. What is your read on the payments delay?",options:[
      {label:"Ask Tunde for a revised date and what exactly is blocking him",score:100,resp:"Good. Facts first, then we decide."},
      {label:"Tell the team to work faster",score:30,resp:"That will not unblock a bank API. Ask what is blocking him."},
      {label:"Say nothing for now",score:50,resp:"Silence hides risk. Raise it early next time."}]},
    {t:"10:00",type:"task",title:"Write a one-page project plan",
      brief:"Create a one-page plan for Driver App 2.0 with the goal, key milestones with dates, owners and the top 2 risks. Upload a file or type your plan.",
      due:"11:15 AM",minWords:40,
      rubric:[
        {label:"Clear goal",keywords:["goal","objective","launch","aim"],fix:"State the goal in one line, for example launch Driver App 2.0 by a date."},
        {label:"Milestones with dates",keywords:["milestone","week","deadline","phase","day "],fix:"Add milestones with dates, for example design handoff, payments done, testing, launch."},
        {label:"Owners",keywords:["owner","responsible","assigned","lead","tunde","amina","bisi"],fix:"Name an owner for each milestone, for example Tunde for payments, Amina for design."},
        {label:"Risks",keywords:["risk","delay","blocker","mitigat","backup"],fix:"List the top 2 risks and how you will reduce each one."}],
      sampleName:"driver-app-plan.pdf",
      sampleBad:"Driver App 2.0 plan. Goal: launch the app in two weeks. Milestones: design handoff, payments screen, testing, launch. The team will work hard to finish everything on time and keep the client happy during the whole project period.",
      sampleGood:"Driver App 2.0 plan. Goal: launch the app to all drivers in two weeks. Milestones: design handoff on Wednesday, payments screen done Friday, testing next Tuesday, launch next Thursday. Owners: Amina for design, Tunde for payments, Bisi for testing, me for coordination. Risks: the bank API may delay payments, so Tunde will build a backup flow; testing may slip, so Bisi starts early."},
    {t:"11:05",type:"followup",from:"chidi",q:"I saw your plan. In one or two sentences, why did you set the milestone dates the way you did?",
      keywords:["because","depends","dependency","buffer","payments","api","testing","time","risk","critical"],minWords:8,
      good:"That shows real thinking. Dates need a reason, not just a guess.",weak:"Try to link each date to a dependency, such as payments before testing."},
    {t:"11:30",type:"decision",q:"Two urgent things, one hour",
      a:{title:"Join the unhappy client call",detail:"Zenith Stores says 40 parcels arrived late. The call starts at 12:00.",score:100,fb:"Right call. The client call cannot move, and you can ask the CEO for 30 more minutes on the report."},
      b:{title:"Finish the weekly CEO report",detail:"It is due at 12:30. The CEO reads it before the board meeting.",score:60,fb:"Understandable, but a client escalation cannot wait. A quick message to the CEO would have bought you time."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"Tunde says payments will take 3 more days. Launch is in 10 days. What do you do first?",
      options:["Move the launch date by 3 days","Check which tasks can run in parallel and find the new critical path","Ask Amina to cut design work","Tell the CEO everything is fine"],correct:1,
      why:"Understand the critical path before moving dates or scope. The delay may not affect launch at all."}
  ]},
  {theme:"Manage risk and people",steps:[
    {t:"09:00",type:"msg",from:"chidi",text:"Day two. Tunde found a workaround for the payments API, but it needs one small design change from Amina."},
    {t:"09:20",type:"reply",from:"amina",text:"If changes keep coming this late I cannot hit my deadlines. This is the third one this week.",options:[
      {label:"Acknowledge it and agree a simple change-request process",score:100,resp:"Thanks, that helps. A process means fewer surprises."},
      {label:"Tell her to just make the change",score:30,resp:"Okay, I will do it, but this is not sustainable."},
      {label:"Agree with her and blame the developers",score:50,resp:"Fair, but that will not get the change done today."}]},
    {t:"10:00",type:"task",title:"Build a risk register",
      brief:"List the top 5 risks for Driver App 2.0. For each one add likelihood, impact, an owner and your response. Upload a file or type it.",
      due:"11:15 AM",minWords:50,
      rubric:[
        {label:"Likelihood and impact",keywords:["likelihood","impact","high","medium","low","probab"],fix:"Rate each risk by likelihood and impact (high, medium, low)."},
        {label:"Owners",keywords:["owner","responsible","assigned","tunde","amina","bisi","chidi"],fix:"Give every risk an owner."},
        {label:"Response plan",keywords:["mitigat","backup","plan b","response","reduce","prevent","contingency"],fix:"Add a response for each risk, such as a backup plan."},
        {label:"Specific risks",keywords:["api","payment","delay","budget","scope","bug","client","testing"],fix:"Name real project risks, such as the payments API, scope changes or testing time."}],
      sampleName:"risk-register.pdf",
      sampleBad:"Risk register for Driver App 2.0. Risk 1: payments API delay. Risk 2: the client may change the scope. Risk 3: testing may take longer. Risk 4: a developer falls sick. Risk 5: the budget may not be enough for the extra work we are planning.",
      sampleGood:"Risk register. 1) Payments API delay: likelihood high, impact high, owner Tunde, response build a backup flow. 2) Scope change from the client: likelihood medium, impact high, owner me, response a change-request process. 3) Testing runs late: likelihood medium, impact medium, owner Bisi, response start testing early. 4) Developer absence: likelihood low, impact medium, owner Tunde, response share knowledge. 5) Budget overrun: likelihood low, impact high, owner me, response weekly cost check."},
    {t:"11:05",type:"followup",from:"chidi",q:"Which of your five risks worries you most, and why?",keywords:["because","payment","api","impact","launch","delay","most","client","scope"],minWords:8,
      good:"Good. Naming one top risk and a reason is what leaders need.",weak:"Pick one risk and say what happens if it goes wrong."},
    {t:"11:30",type:"decision",q:"The client wants a new feature",
      a:{title:"Say yes to live parcel photos",detail:"Zenith Stores asks for it before launch. It adds about 5 days.",score:40,fb:"Saying yes without checking impact puts the launch at risk. Always show the trade-off first."},
      b:{title:"Explain the impact and offer it for version 2.1",detail:"Ship on time, and schedule the feature right after launch.",score:100,fb:"Good judgement. You protected the deadline and kept the client in the plan."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"Which tool shows who is Responsible, Accountable, Consulted and Informed for each task?",
      options:["Gantt chart","RACI matrix","Burndown chart","SWOT analysis"],correct:1,why:"A RACI matrix makes roles clear so nothing falls between people."}
  ]},
  {theme:"Launch decision",steps:[
    {t:"09:00",type:"msg",from:"chidi",text:"Launch is tomorrow. QA found one minor bug: the driver profile photo only refreshes after a restart."},
    {t:"09:25",type:"reply",from:"chidi",text:"The CEO wants an update in the next hour. How do you write it?",options:[
      {label:"Short and honest: status, the known bug, your plan and what you need",score:100,resp:"Exactly what a CEO needs. Send it."},
      {label:"Say all is green and mention the bug later",score:20,resp:"That would damage trust the moment someone finds it."},
      {label:"Send a long technical report",score:55,resp:"Too much detail. Lead with the decision."}]},
    {t:"10:00",type:"task",title:"Write the go / no-go message",
      brief:"Write a short message to the CEO recommending go or no-go for launch. Include the known bug, the risk and your plan. Upload a file or type it.",
      due:"11:15 AM",minWords:45,
      rubric:[
        {label:"Clear recommendation",keywords:["recommend","go ","launch","no-go","proceed"],fix:"Start with your recommendation: go or no-go."},
        {label:"Honest about the bug",keywords:["bug","photo","refresh","restart","issue"],fix:"Mention the known bug clearly."},
        {label:"Risk and plan",keywords:["risk","plan","fix","workaround","monitor","support"],fix:"Explain the risk and your plan, such as a workaround and a fix next week."},
        {label:"Next step",keywords:["next","tomorrow","approve","decision","need"],fix:"End with what you need from the CEO, such as approval."}],
      sampleName:"go-no-go.pdf",
      sampleBad:"Hello CEO. The team has worked hard and the app is nearly ready. We found a small issue with the profile photo not refreshing until the app is restarted. Everyone is doing their best and we hope tomorrow goes well for all drivers and customers.",
      sampleGood:"Hello CEO. I recommend we go ahead and launch tomorrow. One minor bug remains: the driver profile photo only refreshes after a restart. The risk is low because drivers can still deliver. My plan: support will share a simple workaround, Tunde ships the fix next week, and we monitor feedback daily. I need your approval by 5 PM today."},
    {t:"11:05",type:"followup",from:"chidi",q:"Why do you think launching with a minor bug is acceptable here?",keywords:["because","minor","impact","drivers","workaround","low","risk","delay","cost"],minWords:8,
      good:"Clear reasoning. You weighed impact against cost of delay.",weak:"Explain the impact of the bug versus the cost of delaying launch."},
    {t:"11:30",type:"decision",q:"Launch with a known bug?",
      a:{title:"Launch tomorrow with the fix planned for next week",detail:"Tell support, write the workaround, and monitor closely.",score:100,fb:"Sound call. The bug is minor, a delay costs more, and you prepared support."},
      b:{title:"Delay launch by one week",detail:"Fix everything first, then release.",score:50,fb:"Safe, but a week of delay for a minor bug has real cost. Weigh impact against risk."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"After launch, what is the best next step?",
      options:["Close the project and move on","Hold a retrospective and track usage metrics","Start a new project straight away","Wait for complaints"],correct:1,why:"Retrospectives and metrics turn one launch into lessons for the next."}
  ]}
  ]
},

/* ============================ JUNIOR SOFTWARE ENGINEER ============================ */
swe:{
  id:"swe", title:"Junior Software Engineer", short:"SWE", manager:"tunde", cls:"v",
  blurb:"Fix real bugs and ship code for a Lagos logistics startup.",
  learn:["Reproduce, fix and test a real bug","Open a clear pull request and respond to review","Choose between a quick hotfix and the safe route","Ship a release and write a short post-mortem"],
  skills:["Debugging","Git and pull requests","Unit testing","Code review","Incident response","Teamwork"],
  jobs:"Junior Developer, QA Engineer, Support Engineer",
  days:[
  {theme:"Fix your first bug",steps:[
    {t:"09:05",type:"msg",from:"tunde",text:"Welcome to the team. Pull the latest from main. Your first ticket is TKT-214: the Pay button on the Driver App sometimes charges twice."},
    {t:"09:30",type:"msg",from:"bisi",text:"I can reproduce it. A double tap on Pay sends two requests. Screenshot is in the ticket."},
    {t:"09:45",type:"reply",from:"tunde",text:"How would you start?",options:[
      {label:"Reproduce it locally, then find where the request is sent",score:100,resp:"Good. Reproduce first, then fix."},
      {label:"Add a random delay to the button",score:30,resp:"That hides the bug instead of fixing it."},
      {label:"Ask a senior to fix it",score:50,resp:"Ask for help when stuck, but try first."}]},
    {t:"10:00",type:"task",title:"Fix TKT-214 and open a pull request",
      brief:"Stop the Pay button from sending a second request while the first is still running. Write your pull request description, or upload a screenshot of your code change.",
      due:"11:15 AM",minWords:40,
      rubric:[
        {label:"Explains the cause",keywords:["double","twice","two requests","second request","duplicate","cause"],fix:"Explain the cause: two requests are sent when the button is tapped twice."},
        {label:"Describes the fix",keywords:["disable","loading","flag","lock","in flight","pending","debounce"],fix:"Describe the fix, for example disabling the button while the request is running."},
        {label:"Error handling",keywords:["error","fail","catch","retry","re-enable","finally"],fix:"Say what happens if the request fails, such as re-enabling the button."},
        {label:"How it was tested",keywords:["test","tested","verified","reproduce","checked"],fix:"Say how you tested it."}],
      sampleName:"tkt-214-pr.txt",
      sampleBad:"Fixed TKT-214. The Pay button was charging users twice because it sent two requests when tapped quickly. I changed the button code so it only sends one request. Please review my changes and merge them when you can because the team wants this fixed soon.",
      sampleGood:"PR for TKT-214. Cause: a double tap sent two requests, so users were charged twice. Fix: I disable the Pay button and show a loading state while the request is in flight. If the request fails, the button is re-enabled in a finally block so the user can retry. Tested: I reproduced the bug locally, confirmed one request after the fix, and checked the failure path."},
    {t:"11:05",type:"followup",from:"tunde",q:"Why disable the button instead of hiding it or adding a delay?",keywords:["because","user","feedback","loading","retry","reliable","delay","race","clear"],minWords:8,
      good:"Good reasoning. A disabled loading state is clear to users and reliable.",weak:"Think about what the user sees and whether a delay would really prevent the second request."},
    {t:"11:30",type:"decision",q:"Two urgent things, one hour",
      a:{title:"Investigate the production alert",detail:"Drivers cannot see today's route. Reported at 11:20.",score:100,fb:"Right. A live outage beats a pending pull request. Tell Tunde your PR will be late."},
      b:{title:"Finish your pull request for TKT-214",detail:"Tunde wants it before noon.",score:50,fb:"Your PR matters, but drivers are blocked right now. Production issues come first."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"In payments, what is an idempotency key used for?",
      options:["Encrypting card numbers","Making sure the same payment is not processed twice","Speeding up the API","Logging users out"],correct:1,
      why:"The server uses the key to recognise a repeated request and ignore it, which is exactly the double-charge problem."}
  ]},
  {theme:"Tests and code review",steps:[
    {t:"09:00",type:"msg",from:"tunde",text:"Code review day. Your fix works, but Bisi noticed there are no tests for it."},
    {t:"09:20",type:"reply",from:"bisi",text:"Can we merge without tests? The release is close.",options:[
      {label:"No. I will add tests now, it will take 30 minutes",score:100,resp:"Great. That is the habit we want."},
      {label:"Yes, we can add them later",score:30,resp:"Later usually means never. Please add them now."},
      {label:"Ask Tunde to decide",score:55,resp:"Fine, but come with your own view next time."}]},
    {t:"10:00",type:"task",title:"Write 3 unit tests",
      brief:"Write 3 unit tests for the Pay button fix: normal tap, double tap, and failed request. Paste your test names and what each checks, or upload a screenshot of tests passing.",
      due:"11:15 AM",minWords:35,
      rubric:[
        {label:"Normal tap",keywords:["normal","single","one tap","once","success"],fix:"Add a test for a normal single tap."},
        {label:"Double tap",keywords:["double","twice","two taps","rapid","second"],fix:"Add a test for a double tap that sends only one request."},
        {label:"Failed request",keywords:["fail","error","reject","retry","re-enable"],fix:"Add a test for a failed request."},
        {label:"Clear checks",keywords:["expect","assert","should","checks","calls"],fix:"Say what each test checks, for example expects one call."}],
      sampleName:"tests.txt",
      sampleBad:"Test 1: normal tap. It checks that one tap sends the payment request and shows success to the user. Test 2: double tap. It checks that tapping quickly does not cause problems in the application when the user is in a hurry to pay.",
      sampleGood:"Test 1, normal tap: expect one payment call and a success message. Test 2, double tap: tap twice quickly and assert only one request is sent. Test 3, failed request: mock an error, expect the button to be re-enabled so the user can retry. All three tests pass."},
    {t:"11:05",type:"followup",from:"bisi",q:"Which of your three tests would catch the original bug, and why?",keywords:["double","twice","because","second","request","one","catch"],minWords:8,
      good:"Exactly. The double-tap test protects against this bug coming back.",weak:"Name the test and say what it would detect."},
    {t:"11:30",type:"decision",q:"A small fix is needed in production",
      a:{title:"Edit the file directly on main",detail:"Fastest. No review needed.",score:30,fb:"Never edit main directly. Even a small change can break the build for everyone."},
      b:{title:"Create a branch and open a pull request",detail:"Slightly slower, but reviewed and traceable.",score:100,fb:"Correct. Branch, PR and review keeps the team safe."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"Which HTTP status code means a resource was not found?",options:["200","500","404","401"],correct:2,why:"404 means not found. 500 is a server error and 401 means unauthorised."}
  ]},
  {theme:"Ship and learn",steps:[
    {t:"09:00",type:"msg",from:"tunde",text:"Release day. Your fix is approved and ready to ship."},
    {t:"09:25",type:"reply",from:"tunde",text:"How do you want to handle the release?",options:[
      {label:"Plan the deploy, tell the team and watch the logs after",score:100,resp:"That is how a professional ships."},
      {label:"Deploy and go for lunch",score:20,resp:"Never leave a release unwatched."},
      {label:"Ask someone else to deploy",score:50,resp:"You should learn the deploy process yourself."}]},
    {t:"10:00",type:"task",title:"Write a short post-mortem",
      brief:"Write a half-page post-mortem on the double-charge bug: what happened, why, how you fixed it and how to prevent it. Upload a file or type it.",
      due:"11:15 AM",minWords:50,
      rubric:[
        {label:"What happened",keywords:["happened","charged twice","double charge","impact","users"],fix:"Say what happened and who was affected."},
        {label:"Root cause",keywords:["cause","because","root","two requests","double tap"],fix:"Explain the root cause."},
        {label:"The fix",keywords:["fix","disable","loading","resolved","patched"],fix:"Describe how it was fixed."},
        {label:"Prevention",keywords:["prevent","test","review","monitor","idempotency","alert"],fix:"Say how to prevent it, such as tests, review or idempotency keys."}],
      sampleName:"post-mortem.txt",
      sampleBad:"Post-mortem. Some users were charged twice when they paid for deliveries through the Driver App. The bug was caused by the button sending two requests. We fixed it by disabling the button after the first tap and everyone on the team worked well together.",
      sampleGood:"Post-mortem. What happened: some drivers were charged twice at payment. Root cause: a double tap sent two requests because the button stayed active. Fix: the button is now disabled with a loading state while the request runs. Prevention: unit tests for double taps, an idempotency key on the payment API, and an alert for duplicate charges."},
    {t:"11:05",type:"followup",from:"tunde",q:"What is one thing you would do differently next time?",keywords:["test","earlier","review","would","next time","monitor","check","because"],minWords:8,
      good:"Self-awareness like that makes a strong engineer.",weak:"Pick one concrete thing, like writing the test first."},
    {t:"11:30",type:"decision",q:"It is Friday, 4:30 PM",
      a:{title:"Release now with one reviewer offline",detail:"The fix is ready and the team wants it done.",score:40,fb:"A late Friday release with less coverage is risky. If it breaks, nobody is around to help."},
      b:{title:"Release Monday morning",detail:"The whole team is online and can react quickly.",score:100,fb:"Good judgement. Ship when you can support what you ship."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"A new release breaks checkout. What is the fastest safe action?",
      options:["Roll back to the last stable version","Debug directly on production","Ignore it until Monday","Restart the server and hope"],correct:0,why:"Roll back first to stop the damage, then investigate calmly."}
  ]}
  ]
},

/* ============================ DATA ANALYST ============================ */
da:{
  id:"da", title:"Data Analyst", short:"DA", manager:"ngozi", cls:"g",
  blurb:"Turn messy delivery data into a recommendation the CEO can act on.",
  learn:["Clean messy data and document what you changed","Find a clear insight and back it with numbers","Present honestly, including what you are unsure about","Answer tough questions under pressure"],
  skills:["Data cleaning","Analysis","Data storytelling","Honesty with data","Presentation","Attention to detail"],
  jobs:"Data Analyst, Business Analyst, Reporting Officer",
  days:[
  {theme:"Clean the messy data",steps:[
    {t:"09:05",type:"msg",from:"ngozi",text:"Good morning, welcome to the data team. Operations wants a delivery delay report, but our delivery sheet is messy: duplicate rows and missing city names."},
    {t:"09:30",type:"msg",from:"femi",text:"Ops here. Late deliveries are up and the CEO is asking why. Can I get something today?"},
    {t:"09:45",type:"reply",from:"ngozi",text:"Where would you start with the file?",options:[
      {label:"Look at the data first: count rows, check duplicates and missing values",score:100,resp:"Good. Know your data before you touch it."},
      {label:"Build charts straight away",score:35,resp:"You would be charting errors. Inspect first."},
      {label:"Delete any row that looks strange",score:30,resp:"Deleting without a rule changes the story. Document every change."}]},
    {t:"10:00",type:"task",title:"Clean the data and summarise your changes",
      brief:"You have 5,000 delivery rows. Clean the duplicates and missing city names, then write a short note on what you changed, with counts before and after. Upload a file or type your note.",
      due:"11:15 AM",minWords:40,
      rubric:[
        {label:"Duplicates handled",keywords:["duplicate","dedupe","removed","repeated"],fix:"Say how you handled duplicate rows."},
        {label:"Missing values handled",keywords:["missing","blank","null","empty","fill","city"],fix:"Say how you handled missing city names."},
        {label:"Counts before and after",keywords:["before","after","rows","count","from","to "],fix:"Give counts, for example 5,000 rows before and 4,780 after."},
        {label:"Reasoning",keywords:["because","so that","to avoid","accuracy","reason"],fix:"Explain why you made each change."}],
      sampleName:"cleaning-notes.txt",
      sampleBad:"Cleaning notes. I removed the duplicate rows from the delivery sheet and checked the file again to make sure it looks neat and tidy. The data is now ready for use by the operations team and the managers who need the report for their meetings.",
      sampleGood:"Cleaning notes. Before: 5,000 rows. I removed 190 duplicate rows because the same order was recorded twice and would inflate delivery counts. 30 rows had missing city names; I filled 22 from the delivery address and marked 8 as unknown. After: 4,810 rows. Every change is logged so it can be checked."},
    {t:"11:05",type:"followup",from:"ngozi",q:"Why did you remove duplicates instead of averaging them?",keywords:["same order","twice","inflate","double","count","because","accuracy","one record"],minWords:8,
      good:"Right. Duplicates inflate counts, so one record per order is correct.",weak:"Think about what happens to counts if one order appears twice."},
    {t:"11:30",type:"decision",q:"The ops head wants a chart in 20 minutes",
      a:{title:"Send a quick chart with a clear note that numbers are preliminary",detail:"Femi gets something now and knows its limits.",score:100,fb:"Good call. Fast and honest. People can act without being misled."},
      b:{title:"Send the chart without mentioning it is unverified",detail:"It looks clean and finished.",score:30,fb:"That risks decisions based on unchecked numbers. Always label preliminary work."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"A few deliveries took 5 days while most took 1 day. Which measure best shows a typical delivery time?",
      options:["Mean","Median","Maximum","Minimum"],correct:1,why:"The median is not pulled up by a few extreme values."}
  ]},
  {theme:"Find the story",steps:[
    {t:"09:00",type:"msg",from:"ngozi",text:"Day two. The data is clean. Today we find out why deliveries are late."},
    {t:"09:25",type:"reply",from:"femi",text:"I think the drivers are lazy. Can you confirm that in your report?",options:[
      {label:"Say I will check the data and report what it shows, whatever it is",score:100,resp:"Fair enough. I just want to understand the cause."},
      {label:"Agree, to keep Ops happy",score:20,resp:"I would be misled if the data says otherwise."},
      {label:"Ignore the message",score:40,resp:"I still need an answer, please reply."}]},
    {t:"10:00",type:"task",title:"Write 3 insights with numbers",
      brief:"Late deliveries are 18% of orders. Write 3 insights, each with a number, a likely cause and a recommendation. Upload a file or type your insights.",
      due:"11:15 AM",minWords:50,
      rubric:[
        {label:"Uses numbers",keywords:["%","percent","times","average","rows","orders"],fix:"Support each insight with a number or percentage."},
        {label:"Explains a cause",keywords:["because","due to","caused by","driven by","reason"],fix:"Explain a likely cause for each insight."},
        {label:"Recommends action",keywords:["recommend","should","suggest","action","improve"],fix:"Add a recommendation for each insight."},
        {label:"Specific to deliveries",keywords:["delivery","late","route","city","driver","traffic","time"],fix:"Keep insights specific to deliveries, such as routes, cities or time of day."}],
      sampleName:"insights.txt",
      sampleBad:"Insight 1: Lagos has many late deliveries compared with other cities and this may be a problem for the company. Insight 2: Evening orders seem to be delayed more often than morning orders in most of the city areas we serve. Insight 3: Some drivers have more late orders.",
      sampleGood:"Insight 1: 31% of late deliveries are in Lagos Island because of traffic after 4 PM; recommend dispatching earlier there. Insight 2: orders placed after 6 PM are late 27% of the time due to fewer drivers on shift; we should add evening drivers. Insight 3: 3 routes cause 40% of delays; suggest reviewing those routes."},
    {t:"11:05",type:"followup",from:"ngozi",q:"Which insight would you act on first, and why?",keywords:["because","impact","largest","most","biggest","percent","%","easy","fastest","cost"],minWords:8,
      good:"Good prioritisation. You tied the choice to impact.",weak:"Choose one insight and give a reason, such as the biggest impact."},
    {t:"11:30",type:"decision",q:"Your data does not match the CEO's belief",
      a:{title:"Present the finding with evidence, politely",detail:"The data shows the delays come from evening staffing, not driver effort.",score:100,fb:"Right. Honest analysis with evidence is your job, even when it is uncomfortable."},
      b:{title:"Soften the finding so it fits what the CEO expects",detail:"Avoid a difficult conversation.",score:30,fb:"Hiding what the data shows destroys your value as an analyst."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"A chart's y-axis starts at 90 instead of 0, making a small change look huge. This is:",
      options:["Good practice","Misleading","Required for line charts","Faster for viewers"],correct:1,why:"A truncated axis exaggerates differences and can mislead your audience."}
  ]},
  {theme:"Present to the CEO",steps:[
    {t:"09:00",type:"msg",from:"ngozi",text:"Presentation day. The CEO has 10 minutes and wants a clear answer."},
    {t:"09:25",type:"reply",from:"ngozi",text:"How will you open your presentation?",options:[
      {label:"Lead with the finding and the recommendation, then the evidence",score:100,resp:"Yes. Executives want the answer first."},
      {label:"Walk through how I cleaned the data first",score:45,resp:"Too much process. Lead with the answer."},
      {label:"Show every chart I made",score:30,resp:"Too much. Pick the one or two that prove the point."}]},
    {t:"10:00",type:"task",title:"Write a 5-line executive summary",
      brief:"Write a short executive summary for the CEO: the key finding, the evidence, your recommendation and the next step. Upload a file or type it.",
      due:"11:15 AM",minWords:45,
      rubric:[
        {label:"Key finding first",keywords:["finding","found","shows","main","key"],fix:"Open with the key finding."},
        {label:"Evidence",keywords:["%","percent","data","orders","evidence","because"],fix:"Back it up with a number or evidence."},
        {label:"Recommendation",keywords:["recommend","should","suggest","propose"],fix:"State a clear recommendation."},
        {label:"Next step",keywords:["next","by ","timeline","decision","approve","pilot"],fix:"End with a next step and who decides."}],
      sampleName:"executive-summary.txt",
      sampleBad:"Executive summary. We looked at the delivery data for the whole month and prepared a lot of charts and tables for review. The team worked on cleaning, checking and analysing everything carefully, and we are happy to share more details whenever the leadership team has time.",
      sampleGood:"Key finding: late deliveries are driven by evening staffing, not driver effort. Evidence: orders after 6 PM are late 27% of the time, against 9% earlier in the day. Recommendation: add evening drivers on our 3 busiest routes. Next step: approve a 2-week pilot by Friday and review the results the following Monday."},
    {t:"11:05",type:"followup",from:"ngozi",q:"The CEO may ask: how sure are you? What would you say?",keywords:["confident","sure","limit","caveat","sample","data","verify","because","uncertain","check"],minWords:8,
      good:"Honest about certainty. That builds trust.",weak:"Mention how confident you are and one limit of the data."},
    {t:"11:30",type:"decision",q:"The CEO asks for a number you have not verified",
      a:{title:"Say you will confirm it by 3 PM",detail:"Give an honest time to come back with a checked number.",score:100,fb:"Perfect. Honesty and a clear deadline build trust."},
      b:{title:"Give your best guess as if it is certain",detail:"Sound confident in the room.",score:30,fb:"An unchecked number stated as fact can cost you credibility, and decisions."}},
    {t:"13:00",type:"break"},
    {t:"14:30",type:"quiz",q:"What should come first in an executive summary?",
      options:["The data cleaning steps","The key finding or recommendation","A list of all charts","Your job title"],correct:1,why:"Busy leaders read the first lines. Put the answer first."}
  ]}
  ]
}
};

/* ---------- Premium mentors (sample profiles) ---------- */
export const MENTORS: Mentor[] = [
  {id:"m1",name:"Sample Mentor A",title:"Senior Product Manager, fintech",role:"pm",slots:["Sat 10:00 AM","Sat 2:00 PM","Sun 4:00 PM"],color:"#5B2BC4",ini:"SA"},
  {id:"m2",name:"Sample Mentor B",title:"Engineering Manager, logistics tech",role:"swe",slots:["Sat 11:00 AM","Sun 10:00 AM","Sun 5:00 PM"],color:"#0B6E5B",ini:"SB"},
  {id:"m3",name:"Sample Mentor C",title:"Head of Analytics, retail",role:"da",slots:["Sat 1:00 PM","Sun 12:00 PM","Sun 6:00 PM"],color:"#0A5FA8",ini:"SC"}
];

/* ---------- Sample candidates for the employer demo (fictional) ---------- */
export const SAMPLE_CANDS: SampleCand[] = [
  {name:"Chiamaka Obi",uni:"University of Nigeria, Nsukka",role:"pm",days:3,s:{punct:100,task:92,dec:100,crit:90,comm:95}},
  {name:"Tobi Adeyemi",uni:"Obafemi Awolowo University",role:"swe",days:3,s:{punct:95,task:90,dec:100,crit:88,comm:82}},
  {name:"Fatima Bello",uni:"Ahmadu Bello University",role:"da",days:3,s:{punct:100,task:94,dec:100,crit:92,comm:90}},
  {name:"Emeka Nwosu",uni:"Covenant University",role:"swe",days:2,s:{punct:90,task:84,dec:80,crit:78,comm:76}},
  {name:"Zainab Ibrahim",uni:"University of Ilorin",role:"pm",days:3,s:{punct:95,task:88,dec:80,crit:85,comm:92}},
  {name:"Seun Ogunleye",uni:"Wale University",role:"da",days:3,s:{punct:100,task:90,dec:100,crit:86,comm:88}},
  {name:"Ngozi Eze",uni:"University of Lagos",role:"pm",days:2,s:{punct:78,task:82,dec:70,crit:74,comm:80}},
  {name:"Ibrahim Sani",uni:"Bayero University Kano",role:"da",days:3,s:{punct:85,task:80,dec:80,crit:82,comm:70}},
  {name:"Blessing Udoh",uni:"University of Uyo",role:"swe",days:3,s:{punct:100,task:96,dec:100,crit:94,comm:90}},
  {name:"Kelechi Okeke",uni:"Nnamdi Azikiwe University",role:"pm",days:1,s:{punct:70,task:76,dec:60,crit:68,comm:74}},
  {name:"Aisha Musa",uni:"Federal University of Technology, Minna",role:"swe",days:3,s:{punct:90,task:86,dec:80,crit:84,comm:78}},
  {name:"David Afolabi",uni:"Wale University",role:"pm",days:3,s:{punct:95,task:91,dec:100,crit:89,comm:93}}
];

export const FAQ: [string, string][] = [
  ["Is OfficeLife a real job or internship?","No. It is a simulation of a real workday, built from real entry-level tasks. It gives you evidence of what you can do, and employers can check it. It does not replace an internship, it helps you win one."],
  ["How long does it take?","About 10 to 15 minutes per simulated workday. A 1-day simulation takes around 12 minutes, 3 days takes around 40."],
  ["Do I need data or a laptop?","A phone works. The app is a single light page that loads on slow connections, and it keeps working if the AI reviewer is offline."],
  ["How are my tasks reviewed?","By our AI reviewer when it is online, and by a built-in rule-based reviewer when it is not, so you always get feedback. Premium adds a human mentor review of your final project."],
  ["Can employers trust the certificate?","Every certificate has a verification link and QR code. It shows clock-in record, task scores, decisions and the method used to review each task, so employers see evidence, not just a badge."],
  ["Why do you ask for my university?","So your university can see how its students are doing, and so employers can find graduates from specific campuses. You can change it later."]
];
