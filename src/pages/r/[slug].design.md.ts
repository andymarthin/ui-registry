import type { APIRoute } from 'astro';
import { getAllTemplates, type TemplateEntry } from '../../templates/registry';

export const prerender = true;

export function getStaticPaths() {
  return getAllTemplates().map((template) => ({
    params: { slug: template.meta.slug },
    props: { template },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { template } = props as { template: TemplateEntry };
  return new Response(template.designGuide, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
