# WhatsApp reply for Sir (copy-paste)

> Keep this short. Send as one message.

---

Sir, sharing the AWS account details as requested:

1) Email for new AWS account:
farhanbuilds16@gmail.com
(This is a completely new ID — no existing Amazon/AWS account linked to it)

2) Please confirm $200 credit will be added directly on this new account + share validity period

3) Region for testing: ap-south-1 (Mumbai)

4) Services needed (please allow in SCP):
S3, IAM, CloudWatch, Secrets Manager, VPC, ECS, Fargate, ALB, RDS (PostgreSQL), ECR, ACM, EventBridge, SNS, WAF, CloudFormation, Cost Explorer/Budgets, and Bedrock (with spend cap)

Please block/restrict to protect credit:
SageMaker, GPU EC2, heavy unrestricted Bedrock

5) Usage plan so $200 lasts:
- Bedrock: low volume only for development testing (approx 50–200 calls/day when active)
- No SageMaker / no GPU instances
- Compute: prefer ECS Fargate, not always-on EC2
- S3: small testing storage only (<50GB), low egress
- Please set budget alerts at $50 / $100 / $150 / $180 and Bedrock alert around $40–50

AI models / access requested for development:

A) Amazon Bedrock model access (please enable best available):
- Claude Sonnet (latest) — primary daily use
- Claude Haiku (latest) — fast/cheap tasks
- Claude Opus (latest available, including Opus 4.x / 5.x if available)
- Claude Fable (Fable 5.1 / 5.2 or latest if available on our plan)
- Optional later: Titan Embeddings only if needed

B) Kiro account / access:
Please also create/enable a Kiro account for me on the same email (farhanbuilds16@gmail.com).

Please enable the best available models on Kiro for development, including:
- Claude: Sonnet, Opus, Fable, Haiku (latest available)
- OpenAI GPT: best available GPT tiers on Kiro (e.g. GPT-5.6 Sol / Terra / Luna, or latest GPT available)
- xAI Grok: best available Grok model on Kiro (e.g. Grok 4.7 or latest)
- Google Gemini: please enable if Gemini models are available on our Kiro plan
- Auto routing: please enable if available

Kiro is for coding productivity across multiple strong models. Bedrock on the AWS account should stay spend-capped so the $200 infra credit lasts for longer-run testing.

If any of Opus / Fable / GPT / Grok / Gemini need Enterprise or special enablement, please enable whatever is possible for this account and confirm what is approved.

If anything else is needed for SCP, I can confirm quickly.
