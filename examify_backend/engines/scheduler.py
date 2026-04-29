from datetime import datetime, timedelta

INTERVALS = [1, 2, 4, 7, 14, 30, 60]


def get_next_review(ability_score, correct_streak, failure_type):
	now = datetime.utcnow()

	if failure_type in ("conceptual", "recall"):
		return now + timedelta(days=1)
	if ability_score < 0.25:
		return now + timedelta(days=1)

	if ability_score < 0.45:
		interval = INTERVALS[min(correct_streak, 2)]
	else:
		interval = INTERVALS[min(correct_streak, len(INTERVALS) - 1)]

	return now + timedelta(days=interval)


def _get_profile_value(profile, name, default=None):
	if isinstance(profile, dict):
		return profile.get(name, default)
	return getattr(profile, name, default)


def get_session_topics(user_profiles, plan):
	now = datetime.utcnow()
	plan_limits = {"free": 3, "pro": 5, "premium": 6}
	plan_limit = plan_limits.get(plan, 3)

	total_slots = 10
	max_topics = max(1, total_slots // 10)
	max_topics = min(plan_limit, max_topics)

	due = []
	not_due = []

	for profile in user_profiles or []:
		next_review = _get_profile_value(profile, "next_review")
		ability = _get_profile_value(profile, "ability_score", 0.0)
		item = (ability, profile)
		if next_review and next_review <= now:
			due.append(item)
		else:
			not_due.append(item)

	due.sort(key=lambda item: item[0])
	not_due.sort(key=lambda item: item[0])

	due_count = max(1, int(round(max_topics * 0.7)))
	not_due_count = max_topics - due_count

	selected = []
	for _, profile in due[:due_count]:
		selected.append(profile)
	for _, profile in not_due[:not_due_count]:
		selected.append(profile)

	if not selected and user_profiles:
		selected.append(user_profiles[0])

	topics = []
	for profile in selected[:max_topics]:
		topic_name = _get_profile_value(profile, "topic_name")
		if topic_name:
			topics.append(topic_name)

	if not topics and user_profiles:
		fallback = _get_profile_value(user_profiles[0], "topic_name")
		if fallback:
			topics.append(fallback)

	return topics


def compute_readiness(profiles):
	total_attempts = 0
	weighted_sum = 0.0

	for profile in profiles or []:
		attempts = int(_get_profile_value(profile, "total_attempts", 0))
		ability = float(_get_profile_value(profile, "ability_score", 0.0))
		total_attempts += attempts
		weighted_sum += ability * attempts

	if total_attempts == 0:
		return 0
	return int((weighted_sum / total_attempts) * 100)

