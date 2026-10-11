# EmailJS form notifications

Owner instruction (11 October 2026, Europe/Istanbul): all four brands' incoming
website form notifications go to **info@3dyanimda.com** through EmailJS.

## Account configuration

1. Connect the intended sending account in EmailJS and obtain its Service ID.
2. Create the notification template below and obtain its Template ID.
3. Set **To Email** literally to `info@3dyanimda.com`. Do not make it user-controlled.
4. Set **Subject** to `{{subject}}`, **Reply-To** to `{{reply_to}}`, and From Name
   to `{{brand_name}}`. Use the service's verified sending address.
5. Under account security, allow server/non-browser API requests and enable
   private-key authorization. Confirm availability in the actual account.
6. Install these values as Supabase function secrets, never browser variables or
   committed files: EMAILJS_SERVICE_ID, EMAILJS_QUOTE_TEMPLATE_ID,
   EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY and a long random QUOTE_WORKER_SECRET.
   The REST `accessToken` field receives the private key.
7. Deploy `send-quote-email` including its adjacent `emailjs.mjs`, and configure
   one non-overlapping scheduler for the account. It authenticates its POST with
   `Authorization: Bearer <QUOTE_WORKER_SECRET>`. The existing config disables
   gateway JWT verification; the handler enforces this separate server secret.

There is one shared notification template/service for all brands. No per-brand
EmailJS account is required by this implementation. Limits and service quotas must
be checked against the actual account before enabling the schedule.

## Template body

Paste this HTML into the EmailJS template. Double braces deliberately escape all
customer-provided values; do not replace them with triple braces.

```html
<h2>{{brand_name}} — Yeni proje talebi</h2>
<p><strong>Kaynak:</strong> {{source_domain}}<br>
<strong>Talep no:</strong> {{quote_id}}</p>
<p><strong>Ad soyad:</strong> {{customer_name}}<br>
<strong>E-posta:</strong> {{customer_email}}<br>
<strong>Telefon:</strong> {{customer_phone}}<br>
<strong>Firma:</strong> {{company}}</p>
<p><strong>Hizmet:</strong> {{service_type}}<br>
<strong>Adet:</strong> {{quantity}}<br>
<strong>Malzeme:</strong> {{material}}</p>
<p style="white-space:pre-wrap">{{message}}</p>
<p><strong>Dosya:</strong> {{file_name}}</p>
<p><a href="{{admin_url}}">Yönetim panelinde görüntüle</a></p>
```

Private model files remain in Supabase Storage. Emails contain the filename and
authenticated admin entry point, never a public storage URL or file attachment.

## Delivery semantics and verification

- DB submission and notification enqueue are transactional; the frontend's success
  message means the request was saved, not that the email reached the inbox.
- Only active, allowlisted brands and matching tenant/quote pairs may send.
- The worker processes at most five pending items and spaces API calls by >=1100ms.
  EmailJS's documented limit is one request/second. Account-wide concurrency must
  be controlled by a single scheduler; in-process pacing is not a distributed lock.
- API acceptance is marked only after a successful response. Provider/network
  failure leaves the item pending and the quote intact. Five attempts require
  operator review. Invalid tenant/customer data is skipped for correction.
- EmailJS's documented send API has no idempotency key. An ambiguous network error
  or acceptance followed by a DB failure can produce duplicates on retry. Inspect
  EmailJS history and the quote ID before manually retrying such items.
- Before enabling the schedule, inspect the pending queue for old/test requests.
  Submit an explicitly labelled test through each brand's actual form; check its
  DB row, tenant, private upload access, notification record, EmailJS history,
  recipient inbox, reply-to and displayed brand.
- Test an invalid provider configuration in a controlled environment and confirm
  the DB request survives and no successful-delivery flag is recorded.

Run adapter regression tests:
```sh
node --test supabase/functions/send-quote-email/emailjs.test.mjs
```

11 October status: implementation and adapter tests complete. `send-quote-email`
version 1 is ACTIVE in project `zdxjmhhjuomcpdtllnuq`; an invalid worker secret was
rejected with HTTP 401. EmailJS account credentials, one non-overlapping schedule
and actual inbox delivery remain unverified. No notification was sent by this check.
The separate admin-to-customer reply function and Supabase Auth emails are not part
of inbound form notification routing.

Official references, reviewed 11 October 2026:
- https://www.emailjs.com/docs/rest-api/send/
- https://www.emailjs.com/docs/sdk/options/
- https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/
