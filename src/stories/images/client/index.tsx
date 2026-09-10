'use client';
import { ImagesIcon, SquarePenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AspectRatio,
  AutoMedia,
  DeleteDialog,
  dialogs,
  Field,
  FieldGroup,
  FieldLabel,
  ImageUploader,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
  LinkTooltip,
  TooltipDialog,
  useImageUploaderState,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { StoryEntry } from '@/stories';
import {
  Feature,
  stories,
  StoryEntryList,
  useStoryState,
} from '@/stories/client';
import { StoryTab } from '@/stories/client/content';
import { createStoryEntryState } from '@/stories/client/factory';
import { images as main, StoryImage } from '@/stories/images';

const state = createStoryEntryState<StoryImage>(main.name, main.default, 10);
function ContentItem({
  entry: {
    masterId,
    entryType,
    entryId,
    name,
    data: { image, updateAt },
  },
}: {
  entry: StoryEntry<StoryImage>;
}) {
  const { handler, success } = useHandler();
  const { refresh } = state();
  const t = useTranslations();
  const { onFileChange, getImageFileId } = useImageUploaderState('image');
  return (
    <div className={'min-w-1/5 w-96 h-auto p-2'}>
      <Item
        variant={'outline'}
        className={'min-w-1/5 w-64 overflow-hidden relative sc-dc'}
      >
        <ItemHeader>
          <AspectRatio className={'w-full'} ratio={1}>
            <AutoMedia
              filename={image}
              className={'object-cover aspect-square'}
            />
          </AspectRatio>
        </ItemHeader>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription>{updateAt}</ItemDescription>
        </ItemContent>
        <ItemActions
          className={`absolute top-4 right-4 rounded bg-white/70 sc-dc-flex`}
        >
          {image && <LinkTooltip href={image} />}
          <DeleteDialog
            onDelete={handler(async () => {
              await stories.proxy.entry.del(masterId, entryType, entryId);
              success(t('message.delete.success'));
              await refresh();
            })}
            itemName={'story.image'}
          />
          <TooltipDialog
            tooltip={<SquarePenIcon />}
            onSubmit={handler(async (data: FormData) => {
              await stories.proxy.entry.set<StoryImage>(
                masterId,
                entryType,
                entryId,
                {
                  name: data.get('name') as string,
                  data: {
                    image: await getImageFileId(data, 'image_src'),
                    updateAt: Date(),
                  },
                },
              );
              success(t('message.update.success'));
              await refresh();
            })}
            info={dialogs.info(t, 'update', 'story.image')}
          >
            <FieldGroup className="p-4 overflow-auto flex-1">
              <Field>
                <FieldLabel htmlFor={`story-name-${entryId}`}>
                  {t('default.name')}
                </FieldLabel>
                <Input
                  id={`story-name-${entryId}`}
                  defaultValue={name}
                  name={'name'}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`story-image-${entryId}`}>
                  {t('default.cover')}
                </FieldLabel>
                <ImageUploader
                  name={'image'}
                  id={`story-image-${entryId}`}
                  className={'max-w-52'}
                  accept={'image/png'}
                  value={image}
                  onChange={onFileChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`story-image_src-${entryId}`}>
                  {t('default.cover_src')}
                </FieldLabel>
                <Input
                  id={`story-image_src-${entryId}`}
                  defaultValue={image ?? undefined}
                  name={'image_src'}
                />
              </Field>
            </FieldGroup>
          </TooltipDialog>
        </ItemActions>
      </Item>
    </div>
  );
}

function Content() {
  const { item } = useStoryState();
  if (!item) return null;

  return (
    <StoryEntryList<StoryImage>
      state={state}
      className={'overflow-x-hidden overflow-y-auto flex-wrap'}
    >
      {(entry) => <ContentItem entry={entry} />}
    </StoryEntryList>
  );
}

export function FeatureContent() {
  const t = useTranslations();
  return (
    <TooltipDialog
      className={'overflow-hidden'}
      style={{ maxWidth: '86%', height: '86%' }}
      tooltip={<ImagesIcon />}
      info={dialogs.info(t, 'story.image')}
    >
      <Content />
    </TooltipDialog>
  );
}

const feature: Feature = {
  component: FeatureContent,
  id: main.name,
};

const storyTab: StoryTab = {
  id: main.name,
  hidable: true,
  icon: ImagesIcon,
  label: 'image.plural',
  content: Content,
};

export const images = {
  ...main,
  feature,
  tab: {
    story: storyTab,
  },
};
