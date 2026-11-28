# AWS Account + Kiro + Models — Simple Explanation

> For you (before replying to Sir on WhatsApp)  
> Date: 2026-11-27

---

## 1. What Sir’s team is asking

They are creating a **new AWS account** with about **$200 credit**.

They need your answers so they can:
- create the account with the right email
- set **SCP** (Service Control Policy) = which AWS services are allowed / blocked
- protect the $200 so GPU / SageMaker / heavy AI calls do not finish the credit in hours

This AWS account is mainly for **cloud infrastructure + optional Bedrock API testing**.

---

## 2. What is Kiro? (important)

**Kiro** = AWS’s **AI coding IDE / agent** (like an AI pair-programmer tool from Amazon).

| | Kiro | Amazon Bedrock |
|---|---|---|
| What it is | AI IDE to write specs, code, tests, docs | AWS service to call AI models from *your app/code* |
| Where you use it | On your laptop / browser as a development tool | Inside AWS account via API |
| Best models | Claude / GPT / others **inside Kiro chat** | Claude / Titan / Llama etc. via Bedrock API |
| Related to $200 infra credit? | Often billed/credited **separately** (Kiro plans: Free/Pro/etc.) | Yes — Bedrock usage can burn the $200 fast |

### Do you need Kiro for IGshorts?
- **Useful for development** (coding help, specs, AWS infra generation).
- **Not required** to run the live IGshorts charts website.
- If Sir’s team can enable **Kiro access** for you, say **yes, please enable** — especially with strong Claude models.
- Still ask them to keep **Bedrock API spend capped** on the $200 account so infra testing is safe.

---

## 3. Where would you use AI models? (you said you’re not sure yet)

For IGshorts longer-run, realistic uses:

| Use | Tool | Model preference |
|---|---|---|
| Daily coding / debugging / specs | **Kiro** (or Cursor) | Claude Sonnet / Opus, or Auto |
| Future in-app AI features (summaries, support replies, content assist) | **Bedrock API** | Claude Sonnet + Haiku |
| Charts / follower rankings / Meta data | **Not AI** | Official Meta API + your DB |
| Heavy training / SageMaker / GPU servers | **Not needed** | Deny these to save money |

So: ask for **good Claude models**, but do **not** ask for SageMaker/GPU now.

---

## 4. Best models to request (practical + longer-run)

Ask for the **best Claude family available**, including premium ones. If Enterprise-only models need special enablement, ask them to enable whatever is possible and confirm.

### A) **Kiro account** (request explicitly)
- Account email: **`farhanbuilds16@gmail.com`** (new ID, no existing Amazon/AWS account)
- Request the strongest multi-provider set available on the plan:
  1. **Claude Sonnet** (latest) — daily coding  
  2. **Claude Opus** (latest / 4.x / 5.x if available) — hard multi-step work  
  3. **Claude Fable** (5.1 / 5.2 or latest if available) — advanced complex development  
  4. **Claude Haiku** — fast/cheap  
  5. **OpenAI GPT** (best available on Kiro, e.g. GPT-5.6 Sol/Terra/Luna or latest) — alternate strong coding/reasoning  
  6. **xAI Grok** (best available, e.g. Grok 4.7 or latest) — alternate agentic coding  
  7. **Google Gemini** — request if available on the Kiro plan  
  8. **Auto** routing — if available  

Note: Claude/GPT/Grok are commonly listed on Kiro. Gemini availability depends on plan/region — ask them to enable it **if supported**.

### B) **Bedrock** on the AWS account
1. **Claude Sonnet** (primary API model)  
2. **Claude Haiku** (cheap/fast)  
3. **Claude Opus** (latest available)  
4. **Claude Fable** (if Bedrock/plan supports it)  
5. Optional later: Titan Embeddings only if needed  

**Keep spend capped** even if premium models are enabled — Opus/Fable are expensive.

**Do not request now:** large Llama clusters, image/video models, fine-tuning, SageMaker endpoints.

---

## 5. Longer-run safe setup (what “proper system” means)

1. Region: **`ap-south-1` (Mumbai)** for IGshorts infra  
2. Allow: S3, IAM, CloudWatch, Secrets Manager, VPC, ECS/Fargate, ALB, RDS, ECR, ACM, EventBridge, SNS, WAF, CloudFormation, Budgets, Bedrock (capped)  
3. Deny / restrict: GPU EC2, SageMaker, unrestricted Bedrock  
4. Budget alerts: $50 / $100 / $150 / $180  
5. Bedrock: low volume only (~50–200 calls/day in active testing), hard alert ~$40–50  
6. Prefer **Fargate**, not always-on EC2  
7. Kiro: enable for coding productivity; treat as separate from burning infra credit  

---

## 6. Points 1–5 answers (source for WhatsApp)

1. **Email:** `farhanbuilds16@gmail.com` (new ID; no existing Amazon/AWS account)  
2. **$200 credit:** ask them to confirm credit is applied **directly on this new account**, with validity dates.  
3. **Region:** `ap-south-1`  
4. **Services:** S3, IAM, CloudWatch, Secrets Manager, VPC, ECS, Fargate, ALB, RDS, ECR, ACM, EventBridge, SNS, WAF, CloudFormation, Budgets, Bedrock (limited)  
5. **Usage controls:** no SageMaker/GPU; Bedrock low volume; Claude Sonnet + Haiku + Opus + Fable (best available); small S3; budget alerts; **also request Kiro account on same email**  

---

## 7. WhatsApp message

Copy from `AWS_SIR_WHATSAPP_REPLY.md`.
