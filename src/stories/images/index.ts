export interface StoryImage {
  id: string | null;
  updateAt: string;
}

const defaultValue: StoryImage = {
  updateAt: '',
  id: null,
};

export const images = {
  default: defaultValue,
  name: 'image',
  plural: 'images',
};
