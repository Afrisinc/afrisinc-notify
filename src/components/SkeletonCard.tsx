import { motion } from "framer-motion";

export const SkeletonCard = () => {
  const pulse = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
  };

  return (
    <motion.div
      variants={pulse}
      initial="initial"
      animate="animate"
      className="bg-card border border-border rounded-lg p-5 space-y-4"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-16" />
      </div>

      {/* Footer */}
      <div className="pt-2 flex gap-2">
        <div className="h-9 bg-muted rounded flex-1" />
        <div className="h-9 bg-muted rounded flex-1" />
      </div>
    </motion.div>
  );
};

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
