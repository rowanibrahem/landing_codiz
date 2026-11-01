/*
 * Codiz — "Meet Our Instructors" data (single source of truth).
 * To add an instructor: copy one object, change the fields, and put the photo in
 * assets/instructors/. No markup changes are needed.
 *
 *  id     unique slug
 *  name   instructor name
 *  title  job title shown under the name (optional)
 *  photo  image path (initials are shown if the image is missing)
 *  bio    short, polished professional bio
 *
 * Instructors are intentionally NOT linked to any workshop, course, or event.
 */
window.CODIZ_INSTRUCTORS = [
  {
    id: "abdelrahman-osama",
    name: "Abdelrahman Osama",
    title: "Software Quality Assurance Engineer",
    photo: "assets/instructors/abdelrahman-osama.jpg",
    bio:
    "سوفتوير تيستر (QA) بخبرة أكتر من 3 سنين. معتمد بشهادتي ISTQB Foundation و Agile Tester. "
  },
  {
    id: "yomna-arafa",
    name: "Yomna Arafa",
    title: "Business Analyst",
    photo: "assets/instructors/yomna-arafa.jpg",
    bio:
      "محللة أعمال (Business Analyst) بخبرة عملية كبيرة. خريجة  الـ ITI ، وتمتلك خبرة قوية في تطبيق منهجيات الـ Agile وقيادة فرق الـ BA في مشاريع حقيقية. " 
     },
     {
    id: "momen-tarek",
    name: "Momen Tarek",
    title: "Full Stack Developer",
    photo: "assets/instructors/momen-tarek.jpeg",
    bio:
"مهندس Full-Stack وباحث ماجستير في الذكاء الاصطناعي. يمتلك خبرة واسعة في بناء تطبيقات الويب والـ Backend، مع تخصص دقيق في دمج أنظمة الـ AI (مثل الـ LLMs والـ RAG). معتمد من ITIDA و Route IT"
     }
]
