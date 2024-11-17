---
title: RFC
description: RFC Doc for reference
slug: rfc
---


## Problem Specification

The Data Engineering Team currently lacks a structured on-call system for efficient incident response and management. This leads to delays in incident resolution, potential disruptions to data pipelines, and reduced system availability.

![[MT1_page-0006.jpg]]

## Service System

### Overview

The proposed Data On-Call System aims to establish a structured approach to handle incidents and ensure timely resolution, minimizing the impact on critical data infrastructure.

### Architecture

The on-call system will consist of the following components:

-   Incident tracking and management tool: A centralized system to log, track, and prioritize incidents.
-   Communication channels: Dedicated channels for on-call team members to receive notifications and collaborate during incident response.
-   Documentation repository: A centralized repository for incident resolution documentation and knowledge sharing.

## Components

The Data On-Call System will comprise the following components:

-   Incident tracking and management tool (e.g., JIRA, ServiceNow)
-   Communication channels (e.g., Slack, Microsoft Teams)
-   Documentation repository (e.g., Confluence, SharePoint)

## Service Flows

1.  Incident Detection: Incidents will be detected through automated monitoring systems, user-reported issues, or anomaly detection mechanisms.
2.  Incident Notification: The on-call team member will receive notifications through designated communication channels, providing details of the incident.
3.  Incident Triage: The on-call team member will triage the incident, assess its severity, and prioritize it accordingly.
4.  Incident Resolution: The on-call team member will collaborate with relevant stakeholders, follow documented procedures, and work towards resolving the incident.
5.  Post-Incident Analysis: After incident resolution, the on-call team member will document the incident resolution process and share insights for continuous improvement.

## Alternatives

Alternative approaches considered for incident management include:

-   Distributed on-call rotation: Assigning on-call responsibilities to different team members each day.
-   Follow-the-sun model: Handing off incidents to the next time zone when working hours end.

After evaluating the alternatives, a centralized on-call system was deemed most suitable for efficient incident response and knowledge sharing.

## Considerations

-   On-call rotation schedule: Ensuring a fair and balanced rotation schedule to distribute on-call responsibilities among team members.
-   Incident escalation policy: Defining a clear process for escalating incidents to higher-level support or management when necessary.
-   Knowledge sharing mechanisms: Encouraging documentation and sharing of incident resolution procedures to facilitate learning and prevent recurring incidents.

## Performance

Performance metrics and goals for the Data On-Call System include:

-   Incident response time: Aim for a swift response to incidents, minimizing downtime and reducing the impact on data pipelines.
-   Mean time to resolution (MTTR): Strive to minimize the time taken to resolve incidents, ensuring efficient incident management.
-   System availability: Maintain high system availability by promptly addressing incidents and minimizing service disruptions.

## Security

Security considerations for the Data On-Call System encompass:

-   Access controls: Implementing secure access controls to the incident tracking tool and communication channels, ensuring only authorized personnel can access sensitive information.
-   Data privacy: Handling incident-related data in compliance with applicable regulations and privacy requirements.
-   Incident response protocols: Establishing procedures to handle security incidents, ensuring a rapid and appropriate response.

## Data

Data handling within the Data On-Call System will adhere to the following principles:

-   Data collection: Collect and log incident-related data necessary for analysis and incident resolution.
-   Data storage: Store incident-related data securely, ensuring confidentiality and integrity.
-   Data retention: Define data retention policies that align with legal and compliance requirements, considering incident investigation and auditing needs.