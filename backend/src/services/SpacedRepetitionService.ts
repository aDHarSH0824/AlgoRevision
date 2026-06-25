export class SpacedRepetitionService {
  /**
   * Applies SuperMemo SM-2 inspired scheduling.
   * Ratings:
   * "Forgot" -> 0
   * "Hard Recall" -> 1
   * "Easy Recall" -> 2
   */
  calculateNextRevision(
    rating: "Forgot" | "Hard Recall" | "Easy Recall",
    currentEaseFactor: number,
    currentInterval: number,
    currentRevisionCount: number
  ): { nextRevisionAt: Date; easeFactor: number; interval: number; revisionCount: number } {
    let easeFactor = currentEaseFactor;
    let interval = currentInterval;
    let revisionCount = currentRevisionCount;

    if (rating === "Forgot") {
      easeFactor = Math.max(1.3, currentEaseFactor - 0.2);
      interval = 1; // review tomorrow
      revisionCount = 0;
    } else if (rating === "Hard Recall") {
      easeFactor = Math.max(1.3, currentEaseFactor - 0.05);
      if (revisionCount === 0) {
        interval = 1;
      } else if (revisionCount === 1) {
        interval = 3;
      } else {
        interval = Math.round(currentInterval * easeFactor * 0.8);
      }
      revisionCount += 1;
    } else {
      // Easy Recall
      easeFactor = Math.min(2.5, currentEaseFactor + 0.15);
      if (revisionCount === 0) {
        interval = 1;
      } else if (revisionCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(currentInterval * easeFactor);
      }
      revisionCount += 1;
    }

    // Ensure interval is at least 1 day
    if (interval < 1) {
      interval = 1;
    }

    const nextRevisionAt = new Date();
    nextRevisionAt.setDate(nextRevisionAt.getDate() + interval);
    nextRevisionAt.setHours(0, 0, 0, 0); // Round to the start of the day for neat daily check scheduling

    return {
      nextRevisionAt,
      easeFactor,
      interval,
      revisionCount,
    };
  }
}

export default SpacedRepetitionService;
