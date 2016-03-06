'use strict';

const _ = require('lodash');
const joint = require('jointjs');
const React = require('react');
const ReactDOM = require('react-dom');

const Story = require('../models/story');

const getNode = function(nodes, story) {
  let node = nodes[story.id];

  if (!node) {
    node = nodes[story.id] = new joint.shapes.basic.Rect({
      size: {
        width: 30,
        height: 30
      },

      attrs: {
        rect: {
          rx: 2,
          ry: 2,
          fill: '#31D0C6',
          stroke: 'black',
          'stroke-width': 2
        },

        text: {
          text: story.name
        }
      }
    });
  }

  return node;
};

module.exports = React.createClass({
  getDefaultProps() {
    return {
      canvas: document.getElementById('canvas')
    };
  },

  render() {
    if (!this.props.graph) {
      return (<div>Loading...</div>);
    }

    const nodes = {};
    const links = [];

    _.each(this.props.graph.stories, (story) => {
      const storyNode = getNode(nodes, story);

      _.each(story.dependentIds, (id) => {
        const dependent = Story.find(id);

        if (dependent) {
          const dependentNode = getNode(nodes, dependent);

          links.push(new joint.dia.Link({
            source: {
              id: storyNode.id
            },
            target: {
              id: dependentNode.id
            }
          }));
        }
      });
    });

    // const graph = new joint.dia.Graph();
    // graph.addCells(_.values(nodes).concat(links));

    // joint.layout.DirectedGraph.layout(graph, {
    //   setLinkVertices: false,
    //   rankDir: 'TB',
    //   marginX: 50,
    //   marginY: 50,
    //   clusterPadding: {
    //     top: 30,
    //     right: 10,
    //     bottom: 10,
    //     left: 10
    //   }
    // });

    // const paper = new joint.dia.Paper({
    //   el: ReactDOM.findDOMNode(this),
    //   width: 600,
    //   height: 400,
    //   gridSize: 1,
    //   model: graph
    // });

        const graph = new joint.dia.Graph();

        var paper = new joint.dia.Paper({
          el: this.props.canvas,
          width: 800,
          height: 600,
          gridSize: 1,
          model: graph,
          snapLinks: true,
          linkPinning: false,
          embeddingMode: true,
          validateEmbedding: function(childView, parentView) {
            return parentView.model instanceof joint.shapes.devs.Coupled;
          },
          validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet) {
            return sourceMagnet != targetMagnet;
          }
        });

        graph.addCells(_.values(nodes).concat(links));
        // var connect = function(source, sourcePort, target, targetPort) {
        //   var link = new joint.shapes.devs.Link({
        //     source: { id: source.id, selector: source.getPortSelector(sourcePort) },
        //     target: { id: target.id, selector: target.getPortSelector(targetPort) }
        //   });
        //   link.addTo(graph).reparent();
        // };

        // var c1 = new joint.shapes.devs.Coupled({
        //   position: { x: 230, y: 150 },
        //   size: { width: 300, height: 300 },
        //   inPorts: ['in'],
        //   outPorts: ['out 1','out 2']
        // });

        // var a1 = new joint.shapes.devs.Atomic({
        //   position: { x: 360, y: 360 },
        //   inPorts: ['xy'],
        //   outPorts: ['x','y']
        // });

        // var a2 = new joint.shapes.devs.Atomic({
        //   position: { x: 50, y: 260 },
        //   outPorts: ['out']
        // });

        // var a3 = new joint.shapes.devs.Atomic({
        //   position: { x: 650, y: 150 },
        //   size: { width: 100, height: 300 },
        //   inPorts: ['a','b']
        // });

        // c1.embed(a1);

        // connect(a2,'out',c1,'in');
        // connect(c1,'in',a1,'xy');
        // connect(a1,'x',c1,'out 1');
        // connect(a1,'y',c1,'out 2');
        // connect(c1,'out 1',a3,'a');
        // connect(c1,'out 2',a3,'b');

        // rounded corners

        // _.each([c1,a1,a2,a3], function(element) {
        //   element.attr({ '.body': { 'rx': 6, 'ry': 6 }});
        // });

        // custom highlighting

        var highlighter = joint.Vectorizer('circle', {
          'r': 14,
          'stroke': '#ff7e5d',
          'stroke-width': '6px',
          'fill': 'transparent',
          'pointer-events': 'none'
        });

        paper.off('cell:highlight cell:unhighlight').on({

          'cell:highlight': function(cellView, el, opt) {

            if (opt.embedding) {
              joint.Vectorizer(el).addClass('highlighted-parent');
            }

            if (opt.connecting) {
              var bbox = joint.Vectorizer(el).bbox(false, paper.viewport);
              highlighter.translate(bbox.x + 10, bbox.y + 10, { absolute: true });
              joint.Vectorizer(paper.viewport).append(highlighter);
            }
          },

          'cell:unhighlight': function(cellView, el, opt) {

            if (opt.embedding) {
              joint.Vectorizer(el).removeClass('highlighted-parent');
            }

            if (opt.connecting) {
              highlighter.remove();
            }
          }
        });

    joint.layout.DirectedGraph.layout(graph, {
      setLinkVertices: false,
      rankDir: 'TB',
      marginX: 50,
      marginY: 50,
      clusterPadding: {
        top: 30,
        right: 10,
        bottom: 10,
        left: 10
      }
    });

const s1 = _.values(this.props.graph.stories)[0]
const s2 = _.values(this.props.graph.stories)[1]
const s3 = _.values(this.props.graph.stories)[2]
const s4 = _.values(this.props.graph.stories)[3]

s1.addDependent(s2)
s2.addDependent(s3)
s2.addDependency(s4)

s1.save();
s2.save();
s3.save();
s4.save();

return (<div/>);
  }
});
