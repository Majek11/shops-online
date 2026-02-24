import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ReferralBanner = () => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-gradient-to-r from-accent via-accent to-accent/60 flex flex-col md:flex-row relative overflow-hidden"
      style={{ minHeight: 180 }}
    >
      {/* Animated glow orb */}
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* Left section */}
      <motion.div
        className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <motion.p variants={itemVariants} className="text-xs font-semibold text-accent-foreground/70 mb-2">
            Referral Bonus
          </motion.p>
          <motion.h2 variants={itemVariants} className="text-xl font-bold text-foreground mb-2 leading-snug">
            Earn forever when you refer<br />friends to Join!
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Share your referral code and unlock instant rewards when your friends sign up and start using our services.
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="mt-4">
          <motion.button
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.97 }}
          >
            Join Program →
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-accent-foreground/10 my-6" />

      {/* Right section */}
      <motion.div
        className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h3 variants={itemVariants} className="text-lg font-bold text-foreground mb-4">
          Referral Reward Offer
        </motion.h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          {[
            ["0.5%", "on your direct referral purchases,"],
            ["0.3%", "when the purchases of customers they refer, and"],
            ["0.2%", "of their referrals referral"],
          ].map(([pct, text], i) => (
            <motion.li key={i} variants={itemVariants}>
              <span className="font-bold text-primary">{pct}</span> {text}
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </motion.div>
  );
};

export default ReferralBanner;
