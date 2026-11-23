"""One-time, lossless migration of the existing wiki's scientific content."""
from pathlib import Path
from collections import Counter
from lxml import html, etree
import json, hashlib, re, shutil, base64

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public/downloads/wiki-xyna-completa.html'
document = html.fromstring(SOURCE.read_text())
unit_tags = {'p','h1','h2','h3','h4','figcaption','li','td','th','caption','summary'}

def node(element):
    if not isinstance(element.tag, str): return None
    attrs = dict(element.attrib)
    if element.tag == 'img' and attrs.get('data-filename'):
        name = attrs['data-filename']
        original_src = attrs['src']
        attrs['src'] = '/figures/' + name
        attrs['loading'] = 'lazy'
        attrs['decoding'] = 'async'
        if original_src.startswith('data:'):
            (ROOT/'public/figures'/name).write_bytes(base64.b64decode(original_src.split(',',1)[1]))
        else:
            raise ValueError('La fuente de migración debe incorporar sus imágenes: '+name)
    children = []
    if element.text: children.append(element.text)
    for child in element:
        converted = node(child)
        if converted: children.append(converted)
        if child.tail: children.append(child.tail)
    return {'tag':element.tag, 'attrs':attrs, 'children':children}

def text(n):
    if isinstance(n,str): return n
    if n['tag']=='br': return ' '
    return ''.join(text(c) for c in n['children'])

def normalize(s): return re.sub(r'\s+',' ',s).strip()

def units(nodes):
    result=[]
    def walk(n):
        if isinstance(n,str) or n is None: return
        if n['tag']=='nav': return
        if n['tag'] in unit_tags:
            result.append(normalize(text(n)))
        for c in n['children']:walk(c)
    for n in nodes:walk(n)
    return result

section_ids=['proyecto','diseno','experimento','evidencia','equipo']
sections={};topics=[];reference_nodes=[];source_nodes=[]
topic_slugs={'promotores':'promotores','coronta':'coronta','proteina':'proteina','estabilidad':'estabilidad','productos':'productos','metodo':'metodo'}
for section_id in section_ids:
    section=document.get_element_by_id(section_id)
    inner=section.find('div')
    source_nodes.extend(node(e) for e in inner)
    head=inner.find("div[@class='section-head']")
    metadata={
        'eyebrow':node(head.find('div/p')),
        'title':node(head.find('div/h2')),
        'intro':node(head.find('p')),
    }
    body=[]
    for child in inner:
        if child is head: continue
        if section_id=='equipo' and (child.get('id')=='referencias' or 'credits' in child.get('class','')):
            reference_nodes.append(node(child));continue
        if section_id=='evidencia' and child.tag=='article':
            topic_id=child.get('id')
            topic_head=[child.find('span'),child.find('h3'),child.find('p')]
            topics.append({'id':topic_id,'slug':topic_slugs[topic_id],
                'heading':{'eyebrow':node(topic_head[0]),'title':node(topic_head[1]),'intro':node(topic_head[2])},
                'body':[node(e) for e in child if e not in topic_head]})
            continue
        body.append(node(child))
    sections[section_id]={'id':section_id,'heading':metadata,'body':body}

hero_copy=document.xpath("//div[@class='hero-copy']")[0]
hero={}
for key,xpath in [('eyebrow',"p[@class='eyebrow']"),('title','h1'),('question',"p[@class='hero-question']"),('description',"p[@class='hero-description']"),('actions',"div[@class='actions']")]:
    hero[key]=node(hero_copy.find(xpath))
caption=document.xpath("//figcaption[@class='cassette-caption']")[0]
hero['caption']=node(caption)
hero['note']=node(document.xpath("//div[@class='hero-note']")[0])
hero['facts']=node(document.xpath("//div[@class='facts-grid wrap' or @class='wrap facts-grid']")[0])
svg=document.xpath("//div[@class='cassette-drawing']/*[local-name()='svg']")[0]
for decoration in svg.xpath(".//*[local-name()='circle' and @class='cassette-signal']"):
    decoration.getparent().remove(decoration)
svg.set('xmlns','http://www.w3.org/2000/svg')
if 'viewbox' in svg.attrib: svg.set('viewBox', svg.attrib.pop('viewbox'))
(ROOT/'public/figures/cassettes-xyna.svg').write_text(etree.tostring(svg,encoding='unicode'))

model={'hero':hero,'sections':sections,'topics':topics,'references':reference_nodes}
all_model_nodes=[]
for section in sections.values():
    all_model_nodes.extend(section['heading'].values());all_model_nodes.extend(section['body'])
for topic in topics:
    all_model_nodes.extend(topic['heading'].values());all_model_nodes.extend(topic['body'])
all_model_nodes.extend(reference_nodes)
assert Counter(units(source_nodes))==Counter(units(all_model_nodes)), 'Content changed during migration'

for name in ['logo-xyna.svg','logo-xyna-icono.svg','logo-xyna-animado.svg','logo-xyna.png']:
    assert (ROOT/'public/brand'/name).is_file(), 'Falta el logo original: '+name
manifest={'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
          'units':units(source_nodes),
          'heroUnits':units(list(hero.values())),
          'images':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'public/figures').glob('*.png')}}
(ROOT/'src/data/wiki.json').write_text(json.dumps(model,ensure_ascii=False,indent=2))
(ROOT/'src/data/content-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'scientific_content_units':len(manifest['units']),'report_images':len(manifest['images']),'topics':len(topics),'all_text_preserved':True},ensure_ascii=False))
