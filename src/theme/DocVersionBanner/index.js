/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Link from '@docusaurus/Link';
import {
  useAlternatePageUtils, ThemeClassNames,
} from '@docusaurus/theme-common';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalDocVersionBanner from '@theme-original/DocVersionBanner';
import clsx from 'clsx';

function NonDefaultLangLabel({ defaultLocale }) {
  const alternatePageUtils = useAlternatePageUtils();

  const toDefaultLocale = `${alternatePageUtils.createUrl({
    locale: defaultLocale,
    fullyQualified: false,
  })}`;
  
  return (
    <Translate
      id="customtheme.docs.lang.nonDefaultLangLabel"
      description="The label used to tell the user that they're browsing translated docs that might be out of sync"
      values={{
        defaultLocaleLink: (
          <b>
            <Link href={toDefaultLocale} autoAddBaseUrl={false} target='_self'>
              <Translate
                id="customtheme.docs.lang.defaultLocaleLinkLabel"
                description="The label used for the latest version suggestion link label">
                default locale version
              </Translate>
            </Link>
          </b>
        ),
        crowdinLink: (
          <b>
            <Link to="https://crowdin.com/project/flarum-docs">
              <Translate
                id="customtheme.docs.versions.crowdinLinkLabel"
                description="The label used for Crowdin link label">
                on our Crowdin project
              </Translate>
            </Link>
          </b>
        ),
      }}>
      {
        'The translation of this page may not be up to date, please refer to the {defaultLocaleLink} for the latest information. If you would like to contribute, you can do so {crowdinLink}, where we coordinate the translations.'
      }
    </Translate>
  );
}


function DocLangBannerEnabled() {
  const {
    i18n: { defaultLocale, currentLocale },
  } = useDocusaurusContext();

  if (defaultLocale == currentLocale) {
    return '';
  }

  return (
    <div
      className={clsx(
        ThemeClassNames.docs.docVersionBanner,
        'alert alert--warning margin-bottom--md',
      )}
      role="alert">
      <div>
        <NonDefaultLangLabel
          defaultLocale={defaultLocale}
        />
      </div>
    </div>
  );
}

// Hack language warning into version warning.
function DocVersionBanner({ versionMetadata }) {
  return <>
    <OriginalDocVersionBanner versionMetadata={versionMetadata} />
    <DocLangBannerEnabled />
  </>;
}

export default DocVersionBanner;
