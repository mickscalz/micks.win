/* Stable editorial policy: newest collection first, then most captivating.
   Register future rooms with a higher `edition`; do not renumber old releases. */
(function(w){
  'use strict';
  function order(rooms){
    var result=rooms.slice().sort(function(a,b){
      return (b.edition||1)-(a.edition||1) || b.captivation-a.captivation || a.id.localeCompare(b.id);
    });
    var within={};
    result.forEach(function(room,i){
      var edition=room.edition||1;
      within[edition]=(within[edition]||0)+1;
      room.rank=i+1;
      room.collectionRank=within[edition];
    });
    return result;
  }
  w.CabinetCatalogue={order:order};
  w.DESIGNS=order(w.DESIGNS||[]);
})(window);
