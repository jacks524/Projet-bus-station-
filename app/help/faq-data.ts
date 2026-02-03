export type FAQItemRaw = {
  id: number;
  category: string;
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
};

export const RAW_FAQ_DATA: FAQItemRaw[] = [
  {
    id: 1,
    question_fr: "Comment créer un compte sur BusStation ?",
    question_en: "How do I create a BusStation account?",
    answer_fr:
      "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut de la page d'accueil. Remplissez le formulaire avec vos informations personnelles (nom, prénom, email, numéro de téléphone). Vous recevrez un email de confirmation pour activer votre compte.",
    answer_en:
      "To create an account, click the 'Sign up' button at the top of the home page. Fill in the form with your personal details (last name, first name, email, phone number). You will receive a confirmation email to activate your account.",
    category: "account",
  },
  {
    id: 2,
    question_fr: "J'ai oublié mon mot de passe, que faire ?",
    question_en: "I forgot my password, what should I do?",
    answer_fr:
      "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe. Suivez les instructions dans l'email pour créer un nouveau mot de passe.",
    answer_en:
      "Click 'Forgot password' on the login page. Enter your email address and we'll send you a link to reset your password. Follow the instructions in the email to create a new password.",
    category: "account",
  },
  {
    id: 3,
    question_fr: "Comment modifier mes informations personnelles ?",
    question_en: "How do I update my personal information?",
    answer_fr:
      "Connectez-vous à votre compte, puis accédez à 'Mes paramètres' dans le menu. Vous pouvez modifier votre nom, prénom, email, numéro de téléphone et adresse. N'oubliez pas de sauvegarder vos modifications.",
    answer_en:
      "Log in to your account, then go to 'My settings' in the menu. You can edit your last name, first name, email, phone number, and address. Don't forget to save your changes.",
    category: "account",
  },
  {
    id: 4,
    question_fr: "Est-ce que mes données personnelles sont sécurisées ?",
    question_en: "Are my personal data secure?",
    answer_fr:
      "Oui, nous utilisons les dernières technologies de cryptage pour protéger vos données personnelles. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.",
    answer_en:
      "Yes, we use the latest encryption technologies to protect your personal data. Your information is stored securely and is never shared with third parties without your consent.",
    category: "account",
  },
  {
    id: 5,
    question_fr: "Comment réserver un billet de voyage ?",
    question_en: "How do I book a ticket?",
    answer_fr:
      "Allez dans la section 'Réserver', sélectionnez votre ville de départ et d'arrivée, choisissez la date de voyage. Parcourez les voyages disponibles, sélectionnez celui qui vous convient, choisissez vos places et remplissez les informations des passagers. Confirmez votre réservation et procédez au paiement.",
    answer_en:
      "Go to the 'Book' section, select your departure and arrival cities, and choose your travel date. Browse available trips, pick the one that suits you, choose your seats, and enter passenger details. Confirm your booking and proceed to payment.",
    category: "reservation",
  },
  {
    id: 6,
    question_fr: "Puis-je choisir ma place dans le bus ?",
    question_en: "Can I choose my seat on the bus?",
    answer_fr:
      "Oui, lors de la réservation, vous aurez accès à un plan des places du bus. Les places disponibles sont affichées en blanc, les places déjà réservées en rouge, et vos sélections en vert. Cliquez sur les places que vous souhaitez réserver.",
    answer_en:
      "Yes, during booking you'll see a seat map. Available seats are shown in white, reserved seats in red, and your selections in green. Click the seats you want to reserve.",
    category: "reservation",
  },
  {
    id: 7,
    question_fr: "Comment annuler ou modifier ma réservation ?",
    question_en: "How do I cancel or change my booking?",
    answer_fr:
      "Pour annuler ou modifier une réservation, allez dans 'Mes réservations', sélectionnez la réservation concernée et cliquez sur 'Annuler' ou 'Modifier'. Notez que des frais d'annulation peuvent s'appliquer selon les conditions de l'agence et le délai d'annulation.",
    answer_en:
      "To cancel or change a booking, go to 'My bookings', select the booking, and click 'Cancel' or 'Edit'. Cancellation fees may apply depending on agency conditions and timing.",
    category: "reservation",
  },
  {
    id: 8,
    question_fr: "Quel est le délai maximum pour annuler une réservation ?",
    question_en: "What is the latest I can cancel a booking?",
    answer_fr:
      "Le délai d'annulation varie selon l'agence et la classe de voyage. Généralement, vous pouvez annuler jusqu'à 24-48 heures avant le départ. Consultez les conditions d'annulation spécifiques à votre réservation dans la section 'Mes réservations'.",
    answer_en:
      "The cancellation window varies by agency and travel class. Typically you can cancel up to 24–48 hours before departure. Check the specific cancellation conditions in 'My bookings'.",
    category: "reservation",
  },
  {
    id: 9,
    question_fr: "Puis-je réserver pour plusieurs passagers ?",
    question_en: "Can I book for multiple passengers?",
    answer_fr:
      "Oui, lors de la sélection des places, vous pouvez choisir plusieurs sièges. Vous devrez ensuite renseigner les informations de chaque passager (nom, prénom, numéro de pièce d'identité, âge).",
    answer_en:
      "Yes, when selecting seats you can choose multiple seats. You'll then enter each passenger's details (last name, first name, ID number, age).",
    category: "reservation",
  },
  {
    id: 10,
    question_fr: "Quels sont les moyens de paiement acceptés ?",
    question_en: "Which payment methods are accepted?",
    answer_fr:
      "Nous acceptons les paiements par Mobile Money (MTN Mobile Money, Orange Money), ainsi que les cartes bancaires Visa et Mastercard. Le paiement est sécurisé et vos informations bancaires sont protégées.",
    answer_en:
      "We accept Mobile Money (MTN Mobile Money, Orange Money) and Visa/Mastercard cards. Payments are secure and your banking information is protected.",
    category: "payment",
  },
  {
    id: 11,
    question_fr: "Mon paiement a échoué, que faire ?",
    question_en: "My payment failed, what should I do?",
    answer_fr:
      "Si votre paiement échoue, vérifiez d'abord que vous avez suffisamment de fonds. Assurez-vous que vos informations de paiement sont correctes. Si le problème persiste, contactez notre support client ou essayez avec un autre moyen de paiement.",
    answer_en:
      "If your payment fails, first check that you have sufficient funds. Make sure your payment details are correct. If the issue persists, contact our support team or try another payment method.",
    category: "payment",
  },
  {
    id: 12,
    question_fr: "Puis-je obtenir un remboursement ?",
    question_en: "Can I get a refund?",
    answer_fr:
      "Les remboursements sont possibles selon les conditions d'annulation de chaque agence. Si vous annulez dans les délais autorisés, vous serez remboursé selon le taux d'annulation applicable. Le remboursement est généralement effectué sous 5-10 jours ouvrables.",
    answer_en:
      "Refunds are possible depending on each agency's cancellation policy. If you cancel within the allowed timeframe, you will be refunded according to the applicable rate. Refunds are typically processed within 5–10 business days.",
    category: "payment",
  },
  {
    id: 13,
    question_fr: "Où puis-je trouver ma facture ?",
    question_en: "Where can I find my invoice?",
    answer_fr:
      "Après avoir effectué un paiement, vous pouvez télécharger votre facture depuis la section 'Mes billets' ou 'Historique'. Cliquez sur le voyage concerné et sélectionnez 'Télécharger la facture'.",
    answer_en:
      "After making a payment, you can download your invoice from the 'My tickets' or 'History' section. Click the relevant trip and choose 'Download invoice'.",
    category: "payment",
  },
  {
    id: 14,
    question_fr: "Comment puis-je suivre mon voyage en temps réel ?",
    question_en: "How can I track my trip in real time?",
    answer_fr:
      "Une fois votre billet confirmé, vous recevrez des notifications sur l'état de votre voyage. Vous pouvez également consulter les détails dans 'Mes billets' pour voir l'heure de départ prévue et toute mise à jour en temps réel.",
    answer_en:
      "Once your ticket is confirmed, you'll receive notifications about your trip status. You can also check details in 'My tickets' to see the scheduled departure time and real-time updates.",
    category: "travel",
  },
  {
    id: 15,
    question_fr: "Que dois-je faire le jour du voyage ?",
    question_en: "What should I do on the day of travel?",
    answer_fr:
      "Présentez-vous au point de départ au moins 30 minutes avant l'heure de départ. Munissez-vous de votre billet (version numérique ou imprimée) et d'une pièce d'identité valide. Le chauffeur vérifiera votre billet avant l'embarquement.",
    answer_en:
      "Arrive at the departure point at least 30 minutes before departure. Bring your ticket (digital or printed) and a valid ID. The driver will check your ticket before boarding.",
    category: "travel",
  },
  {
    id: 16,
    question_fr: "Puis-je emporter des bagages ?",
    question_en: "Can I bring luggage?",
    answer_fr:
      "Oui, chaque passager peut emporter des bagages. Le nombre et le poids autorisés dépendent de la classe de voyage et de l'agence. Généralement, 1 à 2 bagages de 20-25 kg sont autorisés. Consultez les détails lors de la réservation.",
    answer_en:
      "Yes, each passenger can bring luggage. The number and weight allowed depend on the travel class and the agency. Generally, 1–2 bags of 20–25 kg are allowed. Check the details when booking.",
    category: "travel",
  },
  {
    id: 17,
    question_fr: "Que se passe-t-il si j'arrive en retard ?",
    question_en: "What happens if I arrive late?",
    answer_fr:
      "Si vous arrivez après l'heure de départ, le bus ne vous attendra pas et votre billet sera considéré comme non utilisé. Nous vous recommandons d'arriver au moins 30 minutes à l'avance pour éviter tout problème.",
    answer_en:
      "If you arrive after the departure time, the bus will not wait and your ticket will be considered unused. We recommend arriving at least 30 minutes early.",
    category: "travel",
  },
  {
    id: 18,
    question_fr: "Comment choisir une agence de confiance ?",
    question_en: "How do I choose a trusted agency?",
    answer_fr:
      "Toutes les agences sur BusStation sont validées par notre équipe. Vous pouvez consulter les avis et notes laissés par d'autres voyageurs. Vérifiez également les équipements proposés (WiFi, climatisation, toilettes) et les conditions d'annulation avant de réserver.",
    answer_en:
      "All agencies on BusStation are validated by our team. You can check reviews and ratings from other travelers. Also review offered amenities (WiFi, air conditioning, toilets) and cancellation conditions before booking.",
    category: "agency",
  },
  {
    id: 19,
    question_fr: "Comment contacter une agence de voyage ?",
    question_en: "How do I contact a travel agency?",
    answer_fr:
      "Les coordonnées de chaque agence (téléphone, email, réseaux sociaux) sont disponibles dans la fiche détaillée du voyage. Vous pouvez les contacter directement pour toute question spécifique concernant votre réservation.",
    answer_en:
      "Each agency's contact details (phone, email, social networks) are available in the trip details. You can contact them directly for any specific questions about your booking.",
    category: "agency",
  },
  {
    id: 20,
    question_fr: "Puis-je créer ma propre agence sur BusStation ?",
    question_en: "Can I create my own agency on BusStation?",
    answer_fr:
      "Oui, si vous êtes un professionnel du transport, vous pouvez créer un compte Chef d'Agence et enregistrer votre agence. Votre demande sera examinée par notre équipe de validation avant d'être approuvée. Contactez-nous pour plus d'informations.",
    answer_en:
      "Yes, if you are a transport professional, you can create an Agency Manager account and register your agency. Your request will be reviewed by our validation team before approval. Contact us for more information.",
    category: "agency",
  },
  {
    id: 21,
    question_fr: "Comment contacter le support client ?",
    question_en: "How do I contact customer support?",
    answer_fr:
      "Vous pouvez nous contacter par email à bryanngoupeyou9@gmail.com, par téléphone au +237 655 12 10 10, ou via notre chat en direct disponible du lundi au vendredi de 8h à 18h. Nous nous engageons à répondre dans les 24 heures.",
    answer_en:
      "You can contact us by email at bryanngoupeyou9@gmail.com, by phone at +237 655 12 10 10, or via live chat available Monday to Friday from 8am to 6pm. We aim to respond within 24 hours.",
    category: "support",
  },
  {
    id: 22,
    question_fr: "J'ai un problème technique, qui contacter ?",
    question_en: "I have a technical issue, who should I contact?",
    answer_fr:
      "Pour tout problème technique (erreur de chargement, bug, paiement bloqué), contactez immédiatement notre support technique à bryanngoupeyou9@gmail.com.com ou appelez notre hotline. Décrivez précisément le problème rencontré pour une résolution rapide.",
    answer_en:
      "For any technical issue (loading error, bug, payment blocked), contact our technical support at bryanngoupeyou9@gmail.com or call our hotline. Describe the issue precisely for a quick resolution.",
    category: "support",
  },
  {
    id: 23,
    question_fr: "Proposez-vous une assistance en cas de litige ?",
    question_en: "Do you offer assistance in case of a dispute?",
    answer_fr:
      "Oui, en cas de litige avec une agence, notre service client peut intervenir comme médiateur. Contactez-nous avec les détails de votre réservation et du problème rencontré. Nous ferons de notre mieux pour trouver une solution satisfaisante.",
    answer_en:
      "Yes, in case of a dispute with an agency, our customer service can act as a mediator. Contact us with your booking details and the issue encountered. We'll do our best to find a satisfactory solution.",
    category: "support",
  },
];
