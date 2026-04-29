import math


GUESSING = 0.25
MIDPOINT_TARGET = 0.44
CALIBRATION_BIAS = math.log((1 - GUESSING) / (MIDPOINT_TARGET - GUESSING) - 1)


def p_correct(theta, difficulty, discrimination=1.7):
	exponent = -discrimination * (theta - difficulty) + CALIBRATION_BIAS
	return GUESSING + (1 - GUESSING) / (1 + math.exp(exponent))


def update_ability(theta, correct, difficulty, response_time, avg_time, learning_rate=0.12):
	prob = p_correct(theta, difficulty)
	speed_bonus = 1.2 if (correct and response_time < avg_time * 0.6) else 1.0
	speed_penalty = 0.85 if (not correct and response_time < avg_time * 0.4) else 1.0

	if correct:
		delta = learning_rate * (1 - prob) * speed_bonus
	else:
		delta = -learning_rate * prob * speed_penalty

	updated = theta + delta
	return max(0.0, min(1.0, updated))


def get_target_difficulty(theta):
	return max(0.1, min(0.95, theta - 0.13))


def classify_ability(theta):
	if theta < 0.25:
		return "beginner"
	if theta < 0.45:
		return "weak"
	if theta < 0.65:
		return "developing"
	if theta < 0.80:
		return "strong"
	return "mastered"


def compute_stars(accuracy_pct):
	if accuracy_pct < 80:
		return 0
	if accuracy_pct < 90:
		return 1
	if accuracy_pct < 100:
		return 2
	return 3


def compute_readiness(topic_profiles):
	total_attempts = 0
	weighted_sum = 0.0

	for profile in topic_profiles:
		attempts = int(profile.get("total_attempts", 0))
		ability = float(profile.get("ability_score", 0.0))
		total_attempts += attempts
		weighted_sum += ability * attempts

	if total_attempts == 0:
		return 0
	return int((weighted_sum / total_attempts) * 100)


def compute_level(xp):
	thresholds = [
		(1, 0),
		(2, 100),
		(3, 250),
		(4, 500),
		(5, 900),
		(6, 1400),
		(7, 2000),
		(8, 3000),
		(9, 4500),
		(10, 7000),
	]

	level = 1
	for candidate_level, threshold in thresholds:
		if xp >= threshold:
			level = candidate_level
	return level


if __name__ == "__main__":
	value = p_correct(0.5, 0.5)
	assert abs(value - 0.44) < 0.02

	theta = 0.5
	updated = update_ability(theta, True, 0.5, 20.0, 40.0)
	assert updated > theta

	updated = update_ability(theta, False, 0.5, 10.0, 10.0)
	assert updated < theta

	fast = update_ability(theta, True, 0.5, 5.0, 10.0)
	slow = update_ability(theta, True, 0.5, 10.0, 10.0)
	assert (fast - theta) > (slow - theta)

	assert (compute_stars(79), compute_stars(85), compute_stars(100)) == (0, 1, 3)

	assert (compute_level(0), compute_level(99), compute_level(100)) == (1, 1, 2)

	assert update_ability(0.99, True, 0.1, 2.0, 10.0) <= 1.0
	assert update_ability(0.01, False, 0.9, 2.0, 10.0) >= 0.0

	print("All 8 tests passed.")

