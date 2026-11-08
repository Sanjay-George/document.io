import { Annotation } from '@/models/annotations';
import { Note } from '@/companion/types';

/**
 * Sample notes used by Storybook stories. Adapted from the design prototype's
 * seed data (design/Companion v2.dc.html) — the Halyard host is demo-only, but
 * these note bodies exercise every card state and Markdown feature.
 */
export const sampleNotes: Note[] = [
    {
        id: 'a1',
        n: 1,
        type: 'page',
        selector: 'main > header',
        url: 'halyard.app/deployments',
        title: 'Before you start',
        body:
            'Promoting to Production reaches real customers, so a couple of guardrails apply.\n\n' +
            'First, you need the **Deploy** role — ask an admin under Settings → Access if Promote looks greyed out.\n\n' +
            'Second, every promotion must reference an *approved* change ticket.',
    },
    {
        id: 'a2',
        n: 2,
        type: 'component',
        selector: '#build-4210',
        url: 'halyard.app/deployments',
        title: 'Find your build',
        body: 'Promote the build that passed CI on your feature branch — here `feat/onboarding`. Check the build ID matches.',
    },
    {
        id: 'a3',
        n: 3,
        type: 'component',
        selector: '#build-4210 .status',
        url: 'halyard.app/deployments',
        title: 'Check it is healthy',
        body: 'Wait until the status reads **Passed**. A build still *Building* cannot be promoted.\n\n- Green — healthy\n- Amber — in progress\n- Red — failed',
    },
    {
        id: 'a4',
        n: 4,
        type: 'component',
        selector: '#build-4210 button.promote',
        url: 'halyard.app/deployments',
        title: 'Promote the build',
        body: 'Click **Promote** to open the target picker. This stages the promotion — it does not deploy yet.',
    },
    {
        id: 'a6',
        n: 6,
        type: 'component',
        selector: '.env-actions button.rollback',
        url: 'halyard.app/environments',
        title: 'Rolling back safely',
        body: 'If a release misbehaves, open the environment menu and choose **Roll back** to the last healthy build.',
        onPage: false,
    },
    {
        id: 'a7',
        n: 7,
        type: 'component',
        selector: '#legacy-deploy-toggle',
        url: 'halyard.app/deployments',
        title: 'Legacy deploy toggle',
        body: 'Enable the legacy pipeline before promoting.',
        broken: true,
    },
];

export const noteSetTitle = 'Promoting a build to Production';

/**
 * The same notes in the *persisted* `Annotation` shape, to exercise the
 * adapter (`toNotes`) — i.e. the real path a container replacing
 * `AnnotationListView` would take.
 */
export const sampleAnnotations: Annotation[] = [
    {
        id: 'a1',
        title: 'Before you start',
        value: 'Promoting to Production reaches real customers, so guardrails apply. You need the **Deploy** role.',
        target: 'main > header',
        url: 'halyard.app/deployments',
        documentationId: 'doc-1',
        created: new Date('2026-01-01'),
        updated: new Date('2026-01-01'),
        type: 'page',
        index: 0,
    },
    {
        id: 'a2',
        title: 'Find your build',
        value: 'Promote the build that passed CI on your feature branch — here `feat/onboarding`.',
        target: '#build-4210',
        url: 'halyard.app/deployments',
        documentationId: 'doc-1',
        created: new Date('2026-01-01'),
        updated: new Date('2026-01-01'),
        type: 'component',
        index: 1,
    },
    {
        id: 'a4',
        title: 'Promote the build',
        value: 'Click **Promote** to open the target picker. This stages the promotion — it does not deploy yet.',
        target: '#build-4210 button.promote',
        url: 'halyard.app/deployments',
        documentationId: 'doc-1',
        created: new Date('2026-01-01'),
        updated: new Date('2026-01-01'),
        type: 'component',
        index: 2,
    },
];
