def get_avg_time(difficulty):
	if difficulty < 0.30:
		return 15.0
	if difficulty < 0.50:
		return 30.0
	if difficulty < 0.70:
		return 50.0
	return 80.0


def classify_failure(is_correct, response_time, difficulty, ability_score):
	if is_correct:
		return "correct"

	avg_time = get_avg_time(difficulty)
	fast = response_time < avg_time * 0.65
	slow = response_time > avg_time * 1.6
	weak = ability_score < 0.40

	if weak and slow:
		return "conceptual"
	if not weak and fast:
		return "silly"
	if slow and not weak:
		return "recall"
	return "time"


def update_dna_profile(current_dna, failure_type):
	"""Update the failure DNA profile by incrementing the count for the given failure type.

	Always ensures all four failure keys exist. Only tracks actual failure types
	(conceptual, silly, time, recall) — ignores 'correct'.
	"""
	base = {"conceptual": 0, "silly": 0, "time": 0, "recall": 0}
	updated = {**base, **(current_dna or {})}
	# Only track actual failure types (not "correct")
	if failure_type in base:
		updated[failure_type] = updated.get(failure_type, 0) + 1
	return updated


def get_dominant_weakness(dna):
	keys = ["conceptual", "silly", "time", "recall"]
	counts = {key: int(dna.get(key, 0)) for key in keys}
	max_count = max(counts.values()) if counts else 0
	if max_count == 0:
		return "none"

	winners = [key for key, value in counts.items() if value == max_count]
	if len(winners) > 1:
		return "conceptual"
	return winners[0]


def get_dna_insight(dominant):
	insights = {
		"conceptual": "Core gaps found. These topics need fundamentals, not more practice.",
		"silly": "You know this material. Slow down by 20% per question.",
		"time": "Time pressure is the main issue. Practice timed sets daily.",
		"recall": "Memory fade detected. Review these topics more frequently.",
		"none": "Clean session. Keep the consistency.",
	}
	return insights.get(dominant, "")


def get_dna_color(failure_type):
	colors = {
		"conceptual": "#EF4444",
		"silly": "#F59E0B",
		"time": "#8B5CF6",
		"recall": "#06B6D4",
		"correct": "#10B981",
	}
	return colors.get(failure_type, "")


if __name__ == "__main__":
	assert get_avg_time(0.29) == 15.0
	assert get_avg_time(0.50) == 50.0

	assert classify_failure(True, 10.0, 0.6, 0.2) == "correct"
	assert classify_failure(False, 130.0, 0.3, 0.2) == "conceptual"
	assert classify_failure(False, 8.0, 0.3, 0.7) == "silly"
	assert classify_failure(False, 150.0, 0.7, 0.6) == "recall"
	assert classify_failure(False, 40.0, 0.5, 0.6) == "time"

	dna = update_dna_profile(
		{"conceptual": 2, "silly": 1, "time": 3, "recall": 0}, "time"
	)
	assert (
		dna["time"],
		get_dominant_weakness(dna),
		get_dna_insight("time"),
		get_dna_color("correct"),
		get_dominant_weakness({"conceptual": 3, "silly": 3, "time": 0, "recall": 0}),
	) == (
		4,
		"time",
		"Time pressure is the main issue. Practice timed sets daily.",
		"#10B981",
		"conceptual",
	)

	print("All 8 tests passed.")

