export interface StoryImage {
  image?: string;
  updateAt: string;
}

const defaultValue: StoryImage = {
  updateAt: '',
};

export const images = {
  default: defaultValue,
  name: 'image',
  plural: 'images',
};
