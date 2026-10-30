import { EquipmentType, MuscleGroupId } from "./types";

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroupId;
  equipment: EquipmentType;
  description: string;
  tips: string[];
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Chest
  {
    id: "lib-pushups",
    name: "Push-Ups",
    muscleGroup: "chest",
    equipment: "bodyweight",
    description: "A bodyweight classic that builds chest, shoulder, and tricep strength together.",
    tips: [
      "Keep your body in a straight line from head to heels",
      "Lower until your chest nearly touches the floor",
      "Keep elbows around 45° from your torso, not flared straight out",
    ],
  },
  {
    id: "lib-bench-press",
    name: "Bench Press",
    muscleGroup: "chest",
    equipment: "barbell",
    description: "The standard barbell chest builder — heavy, simple, and effective.",
    tips: [
      "Keep your shoulder blades pinched together and down",
      "Plant your feet firmly and drive through them",
      "Lower the bar to your mid-chest under control",
    ],
  },
  {
    id: "lib-incline-db-press",
    name: "Incline Dumbbell Press",
    muscleGroup: "chest",
    equipment: "dumbbell",
    description: "Targets the upper chest more than a flat press.",
    tips: [
      "Set the bench to a 30–45° incline",
      "Press the dumbbells up and slightly in toward each other",
      "Don't let your lower back arch off the bench",
    ],
  },

  // Back
  {
    id: "lib-pullups",
    name: "Pull-Ups",
    muscleGroup: "back",
    equipment: "bodyweight",
    description: "One of the best builders of back width and grip strength.",
    tips: [
      "Start from a full dead hang",
      "Pull your chest toward the bar, not just your chin",
      "Squeeze your shoulder blades together at the top",
    ],
  },
  {
    id: "lib-bent-row",
    name: "Bent-Over Row",
    muscleGroup: "back",
    equipment: "barbell",
    description: "Builds back thickness by pulling weight into your torso.",
    tips: [
      "Hinge at the hips with a flat back, torso around 45°",
      "Pull the bar toward your lower ribs",
      "Avoid using momentum — keep it controlled",
    ],
  },
  {
    id: "lib-lat-pulldown",
    name: "Lat Pulldown",
    muscleGroup: "back",
    equipment: "barbell",
    description: "A machine-friendly way to train the same pattern as pull-ups.",
    tips: [
      "Lean back slightly and pull the bar to your upper chest",
      "Lead with your elbows, not your hands",
      "Avoid yanking the weight down with your torso",
    ],
  },

  // Shoulders
  {
    id: "lib-ohp",
    name: "Overhead Press",
    muscleGroup: "shoulders",
    equipment: "barbell",
    description: "Builds strong, stable shoulders by pressing weight straight overhead.",
    tips: [
      "Brace your core like you're about to be punched",
      "Press in a straight line, moving your head back slightly to clear it",
      "Finish with the bar directly over your ears",
    ],
  },
  {
    id: "lib-lateral-raise",
    name: "Lateral Raise",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    description: "Isolates the side delts for wider-looking shoulders.",
    tips: [
      "Use lighter weight than you think — this is a form-first move",
      "Lead with your elbows, not your hands",
      "Stop around shoulder height, don't shrug up at the top",
    ],
  },
  {
    id: "lib-face-pull",
    name: "Face Pull",
    muscleGroup: "shoulders",
    equipment: "band",
    description: "Great for rear delts and long-term shoulder health.",
    tips: [
      "Pull toward your face, not your chest",
      "Rotate your hands so your knuckles finish facing behind you",
      "Keep your elbows high, in line with your shoulders",
    ],
  },

  // Biceps
  {
    id: "lib-db-curl",
    name: "Dumbbell Curl",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    description: "The classic biceps builder.",
    tips: [
      "Keep your elbows pinned to your sides",
      "Curl with control — don't swing the weight up",
      "Fully extend at the bottom of each rep",
    ],
  },
  {
    id: "lib-barbell-curl",
    name: "Barbell Curl",
    muscleGroup: "biceps",
    equipment: "barbell",
    description: "Lets you load more weight than dumbbells for the same curl pattern.",
    tips: [
      "Keep a slight bend in your knees, don't rock your hips",
      "Squeeze at the top of the rep",
      "Lower the bar all the way down each time",
    ],
  },
  {
    id: "lib-hammer-curl",
    name: "Hammer Curl",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    description: "A neutral-grip curl that also works the forearms.",
    tips: [
      "Keep your palms facing each other throughout",
      "Avoid swinging your shoulders to move the weight",
      "Control the lowering phase — don't just drop it",
    ],
  },

  // Triceps
  {
    id: "lib-tricep-pushdown",
    name: "Tricep Pushdown",
    muscleGroup: "triceps",
    equipment: "band",
    description: "A simple, joint-friendly triceps isolation move.",
    tips: [
      "Keep your elbows locked at your sides",
      "Fully extend your arms at the bottom",
      "Don't lean your body weight into the movement",
    ],
  },
  {
    id: "lib-overhead-tricep-ext",
    name: "Overhead Tricep Extension",
    muscleGroup: "triceps",
    equipment: "dumbbell",
    description: "Stretches and works the long head of the triceps.",
    tips: [
      "Keep your elbows pointed forward, close to your head",
      "Lower the weight behind your head under control",
      "Avoid flaring your elbows out to the sides",
    ],
  },
  {
    id: "lib-dips",
    name: "Dips",
    muscleGroup: "triceps",
    equipment: "bodyweight",
    description: "A compound push move that hits triceps and chest hard.",
    tips: [
      "Keep your torso upright to bias triceps over chest",
      "Lower until your shoulders are about level with your elbows",
      "Don't let your shoulders roll forward at the bottom",
    ],
  },

  // Quads
  {
    id: "lib-bw-squat",
    name: "Bodyweight Squat",
    muscleGroup: "quads",
    equipment: "bodyweight",
    description: "The foundational movement pattern for leg strength.",
    tips: [
      "Keep your chest up and knees tracking over your toes",
      "Push your hips back like sitting into a chair",
      "Drive through your whole foot, not just your toes",
    ],
  },
  {
    id: "lib-walking-lunges",
    name: "Walking Lunges",
    muscleGroup: "quads",
    equipment: "dumbbell",
    description: "Builds single-leg strength and stability.",
    tips: [
      "Step long enough that your front knee stays over your ankle",
      "Keep your torso upright, don't lean forward",
      "Lower your back knee toward the floor with control",
    ],
  },
  {
    id: "lib-leg-press",
    name: "Leg Press",
    muscleGroup: "quads",
    equipment: "barbell",
    description: "Lets you overload your quads without balancing a bar.",
    tips: [
      "Keep your lower back flat against the pad",
      "Don't lock your knees out hard at the top",
      "Lower until your knees reach about 90°",
    ],
  },

  // Hamstrings
  {
    id: "lib-rdl",
    name: "Romanian Deadlift",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    description: "The best hamstring builder you can do with a barbell.",
    tips: [
      "Push your hips back, keep the bar close to your legs",
      "Keep a soft bend in your knees throughout",
      "Stop when you feel a stretch in your hamstrings, don't round your back",
    ],
  },
  {
    id: "lib-leg-curl",
    name: "Leg Curl",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    description: "Isolates the hamstrings directly.",
    tips: [
      "Keep your hips pressed into the pad",
      "Curl with control, don't let momentum take over",
      "Pause briefly at the top of each rep",
    ],
  },

  // Glutes
  {
    id: "lib-hip-thrust",
    name: "Hip Thrust",
    muscleGroup: "glutes",
    equipment: "barbell",
    description: "One of the most effective direct glute builders.",
    tips: [
      "Drive through your heels, not your toes",
      "Squeeze your glutes hard at the top",
      "Keep your chin tucked and ribs down",
    ],
  },
  {
    id: "lib-glute-bridge",
    name: "Glute Bridge",
    muscleGroup: "glutes",
    equipment: "bodyweight",
    description: "A bodyweight-friendly way to activate and build the glutes.",
    tips: [
      "Squeeze your glutes at the top for a full second",
      "Keep your feet about hip-width apart",
      "Avoid overarching your lower back at the top",
    ],
  },

  // Calves
  {
    id: "lib-standing-calf-raise",
    name: "Standing Calf Raise",
    muscleGroup: "calves",
    equipment: "barbell",
    description: "Builds the visible calf muscle through a full range of motion.",
    tips: [
      "Rise all the way up onto your toes",
      "Lower slowly until you feel a stretch",
      "Keep your knees mostly straight throughout",
    ],
  },
  {
    id: "lib-seated-calf-raise",
    name: "Seated Calf Raise",
    muscleGroup: "calves",
    equipment: "barbell",
    description: "Targets the soleus underneath the main calf muscle.",
    tips: [
      "Keep the balls of your feet firmly on the platform",
      "Pause briefly at the top of each rep",
      "Use a full range of motion rather than small pulses",
    ],
  },

  // Core
  {
    id: "lib-plank",
    name: "Plank",
    muscleGroup: "core",
    equipment: "bodyweight",
    description: "A simple isometric hold that builds core stability.",
    tips: [
      "Keep a straight line from head to heels",
      "Squeeze your glutes and brace your abs like bracing for a punch",
      "Don't let your hips sag or pike up",
    ],
  },
  {
    id: "lib-russian-twist",
    name: "Russian Twist",
    muscleGroup: "core",
    equipment: "bodyweight",
    description: "Builds rotational core strength.",
    tips: [
      "Keep your chest up, don't round your back",
      "Rotate from your torso, not just your arms",
      "Move with control rather than speed",
    ],
  },
  {
    id: "lib-hanging-leg-raise",
    name: "Hanging Leg Raise",
    muscleGroup: "core",
    equipment: "bodyweight",
    description: "An advanced core move that also challenges grip.",
    tips: [
      "Avoid swinging — control the movement",
      "Curl your pelvis slightly at the top for full ab engagement",
      "Lower your legs slowly rather than letting them drop",
    ],
  },
];
