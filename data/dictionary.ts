
import { WordEntry, AgeGroup } from '../types';

/**
 * Bilingual English-Lusoga dictionary.
 * 
 * lusoga = '' means the Lusoga word hasn't been collected yet.
 * lusogaVerified = false means a teacher hasn't confirmed it.
 * 
 * This is by design — empty fields are data collection opportunities
 * during gameplay. The teacher umpire fills gaps as kids play.
 */

export const dictionary: WordEntry[] = [
  // ===== 🌿 NATURE & ANIMALS =====

  // --- High confidence Lusoga ---
  { wordId: 'cow_01', word: 'Cow', definition: 'An animal that gives us milk and meat.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'ente', lusogaVerified: false },
  { wordId: 'goat_02', word: 'Goat', definition: 'A farm animal that climbs rocks.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'embuzi', lusogaVerified: false },
  { wordId: 'chicken_03', word: 'Chicken', definition: 'A bird that lays eggs for us.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'enkoko', lusogaVerified: false },
  { wordId: 'dog_04', word: 'Dog', definition: 'A friendly animal that guards the home.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'embwa', lusogaVerified: false },
  { wordId: 'tree_05', word: 'Tree', definition: 'A tall plant with leaves that gives shade.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'omuti', lusogaVerified: false },
  { wordId: 'water_06', word: 'Water', definition: 'A clear liquid we drink and use to bathe.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'amazzi', lusogaVerified: false },
  { wordId: 'sun_07', word: 'Sun', definition: 'A big ball of fire in the sky that gives light.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'enjuba', lusogaVerified: false },
  { wordId: 'moon_08', word: 'Moon', definition: 'A bright thing in the night sky.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'omwezi', lusogaVerified: false },
  { wordId: 'fire_09', word: 'Fire', definition: 'Something hot that burns and gives light.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'omuliro', lusogaVerified: false },
  { wordId: 'rain_10', word: 'Rain', definition: 'Water that falls from the sky.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'enkuba', lusogaVerified: false },
  { wordId: 'star_11', word: 'Star', definition: 'A tiny bright dot in the sky at night.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'emmunyeenye', lusogaVerified: false },
  { wordId: 'milk_12', word: 'Milk', definition: 'A white drink that comes from a cow.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'amata', lusogaVerified: false },
  { wordId: 'egg_13', word: 'Egg', definition: 'A food that comes from a chicken.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'eggi', lusogaVerified: false },
  { wordId: 'meat_14', word: 'Meat', definition: 'Food that comes from animals.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'ennyama', lusogaVerified: false },

  // --- Medium confidence Lusoga ---
  { wordId: 'bird_15', word: 'Bird', definition: 'An animal with wings that flies.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'ekinyonyi', lusogaVerified: false },
  { wordId: 'snake_16', word: 'Snake', definition: 'A long animal with no legs.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'enzoka', lusogaVerified: false },
  { wordId: 'lion_17', word: 'Lion', definition: 'The king of the jungle with a big mane.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'empologoma', lusogaVerified: false },
  { wordId: 'elephant_18', word: 'Elephant', definition: 'A huge gray animal with a long trunk.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: 'enjovu', lusogaVerified: false },
  { wordId: 'monkey_19', word: 'Monkey', definition: 'A playful animal that loves to climb trees.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'enkima', lusogaVerified: false },
  { wordId: 'flower_20', word: 'Flower', definition: 'A colorful part of a plant that bees love.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'ekimuli', lusogaVerified: false },
  { wordId: 'river_21', word: 'River', definition: 'A long flow of water through the land.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: 'omugga', lusogaVerified: false },
  { wordId: 'mountain_22', word: 'Mountain', definition: 'A very high piece of land.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: 'olusozi', lusogaVerified: false },
  { wordId: 'forest_23', word: 'Forest', definition: 'A large area with many trees and animals.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: 'ekibira', lusogaVerified: false },
  { wordId: 'garden_24', word: 'Garden', definition: 'A place outside where flowers and plants grow.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'olusuku', lusogaVerified: false },

  // --- English-only (complex vocab) ---
  { wordId: 'tiger_25', word: 'Tiger', definition: 'A big orange cat with black stripes.', level: AgeGroup.GRADE_1, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'parrot_26', word: 'Parrot', definition: 'A colorful bird that can mimic sounds.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'dolphin_27', word: 'Dolphin', definition: 'A smart and friendly animal that lives in the ocean.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'shark_28', word: 'Shark', definition: 'A powerful fish with sharp teeth.', level: AgeGroup.GRADE_3, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'octopus_29', word: 'Octopus', definition: 'An underwater creature with eight long arms.', level: AgeGroup.GRADE_3, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'coral_30', word: 'Coral', definition: 'Colorful structures built by tiny sea animals.', level: AgeGroup.GRADE_4, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'whale_31', word: 'Whale', definition: 'The largest animal living in the ocean.', level: AgeGroup.GRADE_2, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'caterpillar_32', word: 'Caterpillar', definition: 'A fuzzy crawler that turns into a butterfly.', level: AgeGroup.GRADE_4, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'beetle_33', word: 'Beetle', definition: 'An insect with a hard shell on its back.', level: AgeGroup.GRADE_5, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'dragonfly_34', word: 'Dragon-fly', definition: 'An insect with four long, clear wings.', level: AgeGroup.GRADE_5, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'grasshopper_35', word: 'Grasshopper', definition: 'An insect that jumps very far.', level: AgeGroup.GRADE_4, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'tyrannosaurus_36', word: 'Tyrannosaurus', definition: 'A giant dinosaur that was a top hunter.', level: AgeGroup.GRADE_6, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'triceratops_37', word: 'Triceratops', definition: 'A dinosaur with three horns on its head.', level: AgeGroup.GRADE_6, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'fossil_38', word: 'Fossil', definition: 'The hard remains of something very old.', level: AgeGroup.GRADE_3, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'jurassic_39', word: 'Jurassic', definition: 'A time long ago when dinosaurs lived.', level: AgeGroup.GRADE_6, topic: 'Nature & Animals', lusoga: '', lusogaVerified: false },
  { wordId: 'cat_40', word: 'Cat', definition: 'A small furry animal that purrs.', level: AgeGroup.PRESCHOOL, topic: 'Nature & Animals', lusoga: 'enjangu', lusogaVerified: false },

  // ===== 🚀 SCIENCE & SPACE =====

  { wordId: 'planet_41', word: 'Planet', definition: 'A large round object that moves around a star.', level: AgeGroup.GRADE_1, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'astronaut_42', word: 'Astronaut', definition: 'A person who travels into outer space.', level: AgeGroup.GRADE_2, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'galaxy_43', word: 'Galaxy', definition: 'A giant collection of billions of stars.', level: AgeGroup.GRADE_4, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'telescope_44', word: 'Telescope', definition: 'A tool used to see things far away in space.', level: AgeGroup.GRADE_3, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'rocket_45', word: 'Rocket', definition: 'A vehicle used to fly into space.', level: AgeGroup.PRESCHOOL, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'skeleton_46', word: 'Skeleton', definition: 'The frame of bones inside your body.', level: AgeGroup.GRADE_3, topic: 'Science & Space', lusoga: 'ekigumba', lusogaVerified: false },
  { wordId: 'heart_47', word: 'Heart', definition: 'The organ that pumps blood through your body.', level: AgeGroup.GRADE_1, topic: 'Science & Space', lusoga: 'omutima', lusogaVerified: false },
  { wordId: 'brain_48', word: 'Brain', definition: 'The control center for your whole body.', level: AgeGroup.GRADE_2, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'muscles_49', word: 'Muscles', definition: 'Parts of your body that help you move.', level: AgeGroup.GRADE_4, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'digestion_50', word: 'Digestion', definition: 'How your body breaks down food.', level: AgeGroup.GRADE_5, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'thunder_51', word: 'Thunder', definition: 'The loud sound that follows lightning.', level: AgeGroup.GRADE_2, topic: 'Science & Space', lusoga: 'okutibwatuka', lusogaVerified: false },
  { wordId: 'rainbow_52', word: 'Rainbow', definition: 'A colorful arc in the sky after rain.', level: AgeGroup.PRESCHOOL, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'blizzard_53', word: 'Blizzard', definition: 'A very strong and snowy wind storm.', level: AgeGroup.GRADE_5, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'tornado_54', word: 'Tornado', definition: 'A spinning wind storm shaped like a funnel.', level: AgeGroup.GRADE_4, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'humidity_55', word: 'Humidity', definition: 'How much water vapor is in the air.', level: AgeGroup.GRADE_6, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'pulley_56', word: 'Pulley', definition: 'A wheel with a rope for lifting things.', level: AgeGroup.GRADE_5, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'lever_57', word: 'Lever', definition: 'A bar used to lift heavy objects.', level: AgeGroup.GRADE_6, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'wheel_58', word: 'Wheel', definition: 'A round object that rolls on the ground.', level: AgeGroup.PRESCHOOL, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'engine_59', word: 'Engine', definition: 'A machine that creates power for movement.', level: AgeGroup.GRADE_3, topic: 'Science & Space', lusoga: '', lusogaVerified: false },
  { wordId: 'robot_60', word: 'Robot', definition: 'A machine that can do tasks on its own.', level: AgeGroup.GRADE_1, topic: 'Science & Space', lusoga: '', lusogaVerified: false },

  // ===== 🏰 HISTORY & ADVENTURE =====

  { wordId: 'kingdom_61', word: 'Kingdom', definition: 'A country ruled by a king or queen.', level: AgeGroup.GRADE_2, topic: 'History & Adventure', lusoga: 'obwakabaka', lusogaVerified: false },
  { wordId: 'armor_62', word: 'Armor', definition: 'A metal suit worn for protection.', level: AgeGroup.GRADE_3, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'shield_63', word: 'Shield', definition: 'A tool used to block an attack.', level: AgeGroup.GRADE_1, topic: 'History & Adventure', lusoga: 'engabo', lusogaVerified: false },
  { wordId: 'drawbridge_64', word: 'Drawbridge', definition: 'A bridge that can be lifted up.', level: AgeGroup.GRADE_4, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'sword_65', word: 'Sword', definition: 'A weapon with a long metal blade.', level: AgeGroup.PRESCHOOL, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'pyramid_66', word: 'Pyramid', definition: 'A huge stone building in Egypt.', level: AgeGroup.GRADE_3, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'pharaoh_67', word: 'Pharaoh', definition: 'A powerful ruler of ancient Egypt.', level: AgeGroup.GRADE_5, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'mummy_68', word: 'Mummy', definition: 'A body preserved from ancient times.', level: AgeGroup.GRADE_4, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'desert_69', word: 'Desert', definition: 'A very dry place with lots of sand.', level: AgeGroup.GRADE_1, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'sphinx_70', word: 'Sphinx', definition: 'A giant statue with a lion body and human head.', level: AgeGroup.GRADE_6, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'treasure_71', word: 'Treasure', definition: 'Gold and jewels found in hidden places.', level: AgeGroup.PRESCHOOL, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'compass_72', word: 'Compass', definition: 'A tool that shows you which way is North.', level: AgeGroup.GRADE_2, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'anchor_73', word: 'Anchor', definition: 'A heavy object that stops a boat from moving.', level: AgeGroup.GRADE_3, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'voyage_74', word: 'Voyage', definition: 'A long journey, usually across the sea.', level: AgeGroup.GRADE_5, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'island_75', word: 'Island', definition: 'A piece of land surrounded by water.', level: AgeGroup.GRADE_1, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'map_76', word: 'Map', definition: 'A drawing that shows where places are.', level: AgeGroup.PRESCHOOL, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'journey_77', word: 'Journey', definition: 'A trip from one place to another.', level: AgeGroup.GRADE_4, topic: 'History & Adventure', lusoga: 'olutambula', lusogaVerified: false },
  { wordId: 'discovery_78', word: 'Discovery', definition: 'Finding something new for the first time.', level: AgeGroup.GRADE_6, topic: 'History & Adventure', lusoga: '', lusogaVerified: false },
  { wordId: 'mountain_79', word: 'Mountain', definition: 'A very high landform with a peak.', level: AgeGroup.GRADE_2, topic: 'History & Adventure', lusoga: 'olusozi', lusogaVerified: false },
  { wordId: 'forest_80', word: 'Forest', definition: 'A large area covered with many trees.', level: AgeGroup.PRESCHOOL, topic: 'History & Adventure', lusoga: 'ekibira', lusogaVerified: false },

  // ===== 🎨 ARTS & SPORTS =====

  { wordId: 'saxophone_81', word: 'Saxophone', definition: 'A curved metal musical instrument.', level: AgeGroup.GRADE_5, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'orchestra_82', word: 'Orchestra', definition: 'A large group of people playing instruments.', level: AgeGroup.GRADE_4, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'rhythm_83', word: 'Rhythm', definition: 'A steady pattern of sounds or beats.', level: AgeGroup.GRADE_3, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'violin_84', word: 'Violin', definition: 'A small wooden instrument with four strings.', level: AgeGroup.GRADE_2, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'guitar_85', word: 'Guitar', definition: 'A musical instrument with strings you pluck.', level: AgeGroup.GRADE_1, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'masterpiece_86', word: 'Masterpiece', definition: 'A very famous and beautiful work of art.', level: AgeGroup.GRADE_6, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'sculpture_87', word: 'Sculpture', definition: 'Art made by carving stone or clay.', level: AgeGroup.GRADE_5, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'canvas_88', word: 'Canvas', definition: 'A strong cloth used for painting pictures.', level: AgeGroup.GRADE_4, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'palette_89', word: 'Palette', definition: 'A board for mixing different paint colors.', level: AgeGroup.GRADE_6, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'texture_90', word: 'Texture', definition: 'How something feels when you touch it.', level: AgeGroup.GRADE_3, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'gymnastics_91', word: 'Gymnastics', definition: 'A sport with flipping and balancing.', level: AgeGroup.GRADE_2, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'basketball_92', word: 'Basketball', definition: 'A game where you throw a ball through a hoop.', level: AgeGroup.GRADE_1, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'helmet_93', word: 'Helmet', definition: 'Hard head protection for sports.', level: AgeGroup.PRESCHOOL, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'tournament_94', word: 'Tournament', definition: 'A series of games to find a winner.', level: AgeGroup.GRADE_6, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'costume_95', word: 'Costume', definition: 'Special clothes worn to look like someone else.', level: AgeGroup.PRESCHOOL, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'performance_96', word: 'Performance', definition: 'Showing a skill in front of an audience.', level: AgeGroup.GRADE_5, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'ballet_97', word: 'Ballet', definition: 'A graceful type of dance with jumps.', level: AgeGroup.GRADE_4, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'audience_98', word: 'Audience', definition: 'People who watch a show or movie.', level: AgeGroup.GRADE_3, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'stage_99', word: 'Stage', definition: 'A raised platform where actors perform.', level: AgeGroup.GRADE_2, topic: 'Arts & Sports', lusoga: '', lusogaVerified: false },
  { wordId: 'dance_100', word: 'Dance', definition: 'Moving your body to music.', level: AgeGroup.PRESCHOOL, topic: 'Arts & Sports', lusoga: 'okuzina', lusogaVerified: false },

  // ===== 🏠 DAILY LIFE =====

  { wordId: 'house_101', word: 'House', definition: 'A building where people live.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'enyumba', lusogaVerified: false },
  { wordId: 'food_102', word: 'Food', definition: 'Things you eat to grow strong.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'emmere', lusogaVerified: false },
  { wordId: 'child_103', word: 'Child', definition: 'A young person.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: 'omwana', lusogaVerified: false },
  { wordId: 'friend_104', word: 'Friend', definition: 'Someone you like and trust.', level: AgeGroup.GRADE_2, topic: 'Daily Life', lusoga: 'omunywani', lusogaVerified: false },
  { wordId: 'name_105', word: 'Name', definition: 'What people call you.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'elinnya', lusogaVerified: false },
  { wordId: 'road_106', word: 'Road', definition: 'A path cars and people use.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: 'oluguudo', lusogaVerified: false },
  { wordId: 'school_107', word: 'School', definition: 'A place where children go to learn.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'essomero', lusogaVerified: false },
  { wordId: 'teacher_108', word: 'Teacher', definition: 'A person who helps you learn.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'omusomesa', lusogaVerified: false },
  { wordId: 'book_109', word: 'Book', definition: 'Something you read with pages inside.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'ekitabo', lusogaVerified: false },
  { wordId: 'doctor_110', word: 'Doctor', definition: 'A person who helps you feel better when sick.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'omusawo', lusogaVerified: false },
  { wordId: 'firefighter_111', word: 'Firefighter', definition: 'A hero who puts out fires.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'librarian_112', word: 'Librarian', definition: 'A person who takes care of books in a library.', level: AgeGroup.GRADE_3, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'scientist_113', word: 'Scientist', definition: 'A person who studies how the world works.', level: AgeGroup.GRADE_4, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'chef_114', word: 'Chef', definition: 'A professional cook who makes yummy meals.', level: AgeGroup.GRADE_2, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'kitchen_115', word: 'Kitchen', definition: 'A room where food is cooked and kept.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: 'ekyoto', lusogaVerified: false },
  { wordId: 'bedroom_116', word: 'Bedroom', definition: 'A cozy room where you sleep at night.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'furniture_117', word: 'Furniture', definition: 'Large items like chairs and tables.', level: AgeGroup.GRADE_5, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'chimney_118', word: 'Chimney', definition: 'A pipe on a roof that lets out smoke.', level: AgeGroup.GRADE_3, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'helicopter_119', word: 'Helicopter', definition: 'An aircraft with spinning blades on top.', level: AgeGroup.GRADE_2, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'submarine_120', word: 'Submarine', definition: 'A ship that can go underwater.', level: AgeGroup.GRADE_5, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'bicycle_121', word: 'Bicycle', definition: 'A vehicle with two wheels you pedal.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'locomotive_122', word: 'Locomotive', definition: 'A powerful engine that pulls a train.', level: AgeGroup.GRADE_6, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'vegetables_123', word: 'Vegetables', definition: 'Healthy plants like carrots and broccoli.', level: AgeGroup.GRADE_2, topic: 'Daily Life', lusoga: 'enva', lusogaVerified: false },
  { wordId: 'nutrition_124', word: 'Nutrition', definition: 'How food keeps your body healthy.', level: AgeGroup.GRADE_6, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'vitamin_125', word: 'Vitamin', definition: 'Something in food that helps you stay strong.', level: AgeGroup.GRADE_4, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'fruit_126', word: 'Fruit', definition: 'Sweet and healthy treats from plants.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'ebibala', lusogaVerified: false },
  { wordId: 'protein_127', word: 'Protein', definition: 'Part of food that builds strong muscles.', level: AgeGroup.GRADE_6, topic: 'Daily Life', lusoga: '', lusogaVerified: false },
  { wordId: 'salt_128', word: 'Salt', definition: 'A white powder that makes food tasty.', level: AgeGroup.GRADE_2, topic: 'Daily Life', lusoga: 'omunyo', lusogaVerified: false },

  // ===== 🌍 EXTRA LUSOGA-WORTHY WORDS =====
  // These are words that matter most in Butegere daily life

  { wordId: 'head_129', word: 'Head', definition: 'The top part of your body.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'omutwe', lusogaVerified: false },
  { wordId: 'eye_130', word: 'Eye', definition: 'The part of your body you see with.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'eliiso', lusogaVerified: false },
  { wordId: 'hand_131', word: 'Hand', definition: 'The part at the end of your arm.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'omukono', lusogaVerified: false },
  { wordId: 'leg_132', word: 'Leg', definition: 'The part of your body you walk with.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okugulu', lusogaVerified: false },
  { wordId: 'eat_133', word: 'Eat', definition: 'To put food in your mouth and swallow.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okulya', lusogaVerified: false },
  { wordId: 'drink_134', word: 'Drink', definition: 'To take liquid into your mouth.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okunywa', lusogaVerified: false },
  { wordId: 'sleep_135', word: 'Sleep', definition: 'To close your eyes and rest at night.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okusula', lusogaVerified: false },
  { wordId: 'walk_136', word: 'Walk', definition: 'To move using your feet.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okutambula', lusogaVerified: false },
  { wordId: 'speak_137', word: 'Speak', definition: 'To say words out loud.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: 'okwogela', lusogaVerified: false },
  { wordId: 'play_138', word: 'Play', definition: 'To have fun doing something.', level: AgeGroup.PRESCHOOL, topic: 'Daily Life', lusoga: 'okuzana', lusogaVerified: false },
  { wordId: 'learn_139', word: 'Learn', definition: 'To find out something new.', level: AgeGroup.GRADE_1, topic: 'Daily Life', lusoga: 'okuyiga', lusogaVerified: false },
];
