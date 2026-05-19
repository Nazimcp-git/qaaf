// ============================================================
// QAF – Sample Data Seeder
// Run this ONCE in browser console after setting up Firebase
// ============================================================

async function seedSampleData() {
  console.log('🌱 Seeding QAF sample data...');

  // 1. Create admin user (do this via Firebase Console first, then run):
  // await db.ref('users/ADMIN_UID_HERE').set({ role: 'admin', email: 'admin@qaf.org' });

  // 2. Sample Categories
  const categories = [
    { name: 'Quran Recitation', icon: '📖', order: 1 },
    { name: 'Calligraphy', icon: '✍️', order: 2 },
    { name: 'Speech & Debate', icon: '🎤', order: 3 },
    { name: 'Visual Arts', icon: '🎨', order: 4 },
    { name: 'Literary Arts', icon: '📝', order: 5 },
    { name: 'Performing Arts', icon: '🎭', order: 6 },
    { name: 'Quiz & Knowledge', icon: '💡', order: 7 },
    { name: 'Digital Media', icon: '🌐', order: 8 }
  ];

  for (const cat of categories) {
    await DbService.categories.create(cat);
  }
  console.log('✅ Categories created');

  // 3. Sample Programs
  const programs = [
    { title: 'Quran Hifz', category: 'Quran Recitation', participantLimit: 2, ageLimit: null, topicRequired: false, description: 'Memorization and recitation of selected Quranic passages with tajweed' },
    { title: 'Quran Tilawah', category: 'Quran Recitation', participantLimit: 2, ageLimit: null, topicRequired: false, description: 'Beautiful melodic recitation of Holy Quran' },
    { title: 'Tafseer Presentation', category: 'Quran Recitation', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Scholarly presentation on Quranic interpretation' },
    { title: 'Arabic Calligraphy', category: 'Calligraphy', participantLimit: 2, ageLimit: null, topicRequired: false, description: 'Traditional Arabic calligraphy in Naskh, Thuluth, or Diwani styles' },
    { title: 'Quran Verse Art', category: 'Calligraphy', participantLimit: 2, ageLimit: null, topicRequired: true, description: 'Creative artistic rendition of Quranic verses' },
    { title: 'Arabic Speech', category: 'Speech & Debate', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Eloquent speech in Arabic on given Islamic topic' },
    { title: 'Urdu Speech', category: 'Speech & Debate', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Speech in Urdu on Islamic subject matter' },
    { title: 'English Speech', category: 'Speech & Debate', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'English oration on contemporary Islamic themes' },
    { title: 'Debate', category: 'Speech & Debate', participantLimit: 2, ageLimit: null, topicRequired: true, description: 'Structured debate on Islamic scholarly topics' },
    { title: 'Islamic Poster Design', category: 'Visual Arts', participantLimit: 2, ageLimit: null, topicRequired: false, description: 'Creative poster design with Islamic themes' },
    { title: 'Hadith Illustration', category: 'Visual Arts', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Visual illustration inspired by Prophetic traditions' },
    { title: 'Islamic Poetry (Arabic)', category: 'Literary Arts', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Original Arabic poetry on Islamic themes' },
    { title: 'Islamic Poetry (Urdu)', category: 'Literary Arts', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Urdu nazm or ghazal with Islamic essence' },
    { title: 'Essay Writing', category: 'Literary Arts', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Scholarly essay on given Islamic topic' },
    { title: 'Story Writing', category: 'Literary Arts', participantLimit: 1, ageLimit: null, topicRequired: true, description: 'Creative fiction with Islamic moral values' },
    { title: 'Nasheed (Group)', category: 'Performing Arts', participantLimit: 5, ageLimit: null, topicRequired: false, description: 'Group Islamic nasheed performance without instruments' },
    { title: 'Nasheed (Solo)', category: 'Performing Arts', participantLimit: 1, ageLimit: null, topicRequired: false, description: 'Individual nasheed performance' },
    { title: 'Skit / Drama', category: 'Performing Arts', participantLimit: 8, ageLimit: null, topicRequired: true, description: 'Short dramatic performance with Islamic message' },
    { title: 'Islamic Quiz', category: 'Quiz & Knowledge', participantLimit: 3, ageLimit: null, topicRequired: false, description: 'Team quiz on Quran, Hadith, Seerah, and Islamic history' },
    { title: 'Quran Quiz', category: 'Quiz & Knowledge', participantLimit: 2, ageLimit: null, topicRequired: false, description: 'Specialized quiz on Quranic knowledge' },
    { title: 'Short Film', category: 'Digital Media', participantLimit: 4, ageLimit: null, topicRequired: true, description: 'Short documentary or film on Islamic theme (max 7 minutes)' },
    { title: 'Social Media Campaign', category: 'Digital Media', participantLimit: 3, ageLimit: null, topicRequired: true, description: 'Islamic awareness campaign design for social media' }
  ];

  for (const prog of programs) {
    await DbService.programs.create(prog);
  }
  console.log('✅ Programs created (' + programs.length + ')');

  // 4. Sample Settings
  await DbService.settings.update({
    registrationOpen: true,
    topicSubmissionOpen: true,
    resultsPublished: false,
    eventName: 'Quranic Art Fest 2026',
    eventDate: '2026-08-15'
  });
  console.log('✅ Settings configured');

  // 5. Sample Announcements
  await DbService.announcements.create({ title: 'Registrations Open!', text: 'Team registration portal is now live. Register your institution today!' });
  await DbService.announcements.create({ title: 'Program List Updated', text: 'We have added 22 exciting programs across 8 categories. Check them out!' });
  await DbService.announcements.create({ title: 'Early Bird Offer', text: 'Teams registering before June 15th will receive special benefits. Don\'t miss out!' });
  console.log('✅ Announcements created');

  console.log('🎉 Sample data seeding complete!');
  console.log('📌 Remember to create admin user in Firebase Console:');
  console.log('   1. Create user with email admin@qaf.org');
  console.log('   2. Get the UID from Firebase Auth');
  console.log('   3. Run: db.ref("users/YOUR_UID").set({role:"admin",email:"admin@qaf.org"})');
}

// Uncomment and run in browser console:
// seedSampleData();
