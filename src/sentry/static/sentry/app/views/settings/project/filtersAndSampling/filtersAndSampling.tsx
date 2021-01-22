import React from 'react';

import SentryDocumentTitle from 'app/components/sentryDocumentTitle';
import {t} from 'app/locale';
import {Organization, Project} from 'app/types';
import withProject from 'app/utils/withProject';

import Filters from './filters';
import Sampling from './sampling';

type Props = {
  project: Project;
  organization: Organization;
  hasAccess: boolean;
};

function FiltersAndSampling({project, organization, hasAccess}: Props) {
  return (
    <SentryDocumentTitle title={t('Filters & Sampling')} objSlug={project.id}>
      <React.Fragment>
        <Filters
          projectSlug={project.slug}
          orgSlug={organization.slug}
          hasAccess={hasAccess}
        />
        <Sampling project={project} organization={organization} hasAccess={hasAccess} />
      </React.Fragment>
    </SentryDocumentTitle>
  );
}

export default withProject(FiltersAndSampling);
