import defaultComponents from "fumadocs-ui/mdx";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { ArticleImage } from "./article-image";
import Link from "./site-link";
export const mdxComponents = {
  ...defaultComponents,
  a: Link,
  img: ArticleImage,
  Tabs,
  Tab,
  Steps,
  Step,
  Accordion,
  Accordions,
};
